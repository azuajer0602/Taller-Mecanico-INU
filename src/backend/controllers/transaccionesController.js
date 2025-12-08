import Transaccion from '../models/Transaccion.js';
import DetalleTransaccion from '../models/DetalleTransaccion.js';
import TipoTransaccion from '../models/TipoTransaccion.js';
import { Op } from 'sequelize';

export const getAllTransacciones = async (req, res) => {
  try {
    const transacciones = await Transaccion.findAll({
      include: [
        {
          model: TipoTransaccion,
          as: 'tipo_transaccion',
          attributes: ['nombre_tipo', 'codigo_tipo_transaccion', 'tipo_cuenta']
        },
        {
          model: DetalleTransaccion,
          as: 'detalles',
          // Agregamos 'id_tipo_transaccion_fk' para que se vea en el SELECT
          attributes: [
            'id_detalle', 
            'debe', 
            'haber', 
            'descripcion_detalle', 
            'es_cuenta_por_pagar', 
            'es_cuenta_por_cobrar', 
            'fecha_vencimiento',
            'Tipo_de_pago',
            'id_tipo_transaccion_fk' // <--- AQUI LO PIDO
          ]
        }
      ],
      order: [['fecha_asiento', 'DESC']]
    });
    
    res.json({
      success: true,
      data: transacciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacciones',
      error: error.message
    });
  }
};

export const getTransaccionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaccion = await Transaccion.findByPk(id, {
      include: [
        { model: TipoTransaccion, as: 'tipo_transaccion' },
        { model: DetalleTransaccion, as: 'detalles' } 
        // Sequelize traerá id_tipo_transaccion_fk automáticamente en los detalles
      ]
    });
    
    if (!transaccion) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }
    
    res.json({ success: true, data: transaccion });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener transacción', error: error.message });
  }
};

export const createTransaccion = async (req, res) => {
  try {
    // Recibimos id_tipo_transaccion_fk del body principal
    const { id_tipo_transaccion_fk, fecha_asiento, Tipo_de_pago, detalles } = req.body;
    
    // --- LÓGICA DE TIPO DE PAGO ---
    let pagoReal = Tipo_de_pago;
    if (!pagoReal && detalles && detalles.length > 0) {
        pagoReal = detalles[0].Tipo_de_pago;
    }
    const pagoAInsertar = pagoReal || 'No especificado';

    // 1. Crear Transacción Padre
    const transaccion = await Transaccion.create({
      id_tipo_transaccion_fk, // Se guarda en la tabla padre
      fecha_asiento
    });
    
    // 2. Crear Detalles
    if (detalles && detalles.length > 0) {
      const detallesConTransaccion = detalles.map(detalle => ({
        ...detalle,
        id_transaccion: transaccion.id_transaccion,
        
        Tipo_de_pago: pagoAInsertar,
        
        // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
        // Le pasamos al detalle el mismo ID FK que usó el padre
        id_tipo_transaccion_fk: id_tipo_transaccion_fk 
      }));
      
      await DetalleTransaccion.bulkCreate(detallesConTransaccion);
    }
    
    res.status(201).json({ success: true, message: 'Guardado', data: transaccion });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Ejemplo de la función en tu controlador backend (Node.js)
export const cambiarEstadoTransaccion = async (req, res) => {
    const { id } = req.params;
    try {
        // Actualizamos TODOS los detalles de esa transacción
        // Ponemos las banderas de deuda en 0
        await DetalleTransaccion.update(
            { 
                es_cuenta_por_pagar: 0,
                es_cuenta_por_cobrar: 0,
                // Opcional: Podrías limpiar la fecha de vencimiento si quieres
                // fecha_vencimiento: null 
            },
            { where: { id_transaccion: id } }
        );

        res.json({ success: true, message: 'Estado actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al actualizar estado' });
    }
};



export const getTransaccionesByFecha = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ success: false, message: 'Se requieren fechas' });
    }
    
    const transacciones = await Transaccion.findAll({
      where: {
        fecha_asiento: { [Op.between]: [fecha_inicio, fecha_fin] }
      },
      include: [
        { model: TipoTransaccion, as: 'tipo_transaccion' },
        {
          model: DetalleTransaccion,
          as: 'detalles',
          // Agregamos el campo nuevo al SELECT también
          attributes: [
            'id_detalle', 
            'debe', 
            'haber', 
            'descripcion_detalle', 
            'es_cuenta_por_pagar', 
            'es_cuenta_por_cobrar', 
            'fecha_vencimiento',
            'Tipo_de_pago',
            'id_tipo_transaccion_fk' // <--- AQUI
          ]
        }
      ],
      order: [['fecha_asiento', 'ASC']]
    });
    
    res.json({ success: true, data: transacciones });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error por fecha', error: error.message });
  }
};