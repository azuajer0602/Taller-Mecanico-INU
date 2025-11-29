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
          // AGREGADO: 'Tipo_de_pago' a los atributos para que se envíe al frontend
          attributes: ['id_detalle', 'debe', 'haber', 'descripcion_detalle', 'es_cuenta_por_pagar', 'es_cuenta_por_cobrar', 'fecha_vencimiento', 'Tipo_de_pago']
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
        {
          model: TipoTransaccion,
          as: 'tipo_transaccion'
        },
        {
          model: DetalleTransaccion,
          as: 'detalles'
        }
      ]
    });
    
    if (!transaccion) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: transaccion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacción',
      error: error.message
    });
  }
};

export const createTransaccion = async (req, res) => {
  try {
    const { id_tipo_transaccion_fk, fecha_asiento, detalles } = req.body;
    
    // 1. Crear la cabecera (Transacción)
    const transaccion = await Transaccion.create({
      id_tipo_transaccion_fk,
      fecha_asiento
    });
    
    // 2. Crear los detalles
    if (detalles && detalles.length > 0) {
      const detallesConTransaccion = detalles.map(detalle => ({
        ...detalle,
        id_transaccion: transaccion.id_transaccion,
        // IMPORTANTE: Aseguramos que el campo Tipo_de_pago se guarde.
        // Si el frontend envía "metodoPago" o "Tipo_de_pago", lo asignamos aquí.
        // Ponemos un valor por defecto para evitar errores de base de datos si viene vacío.
        Tipo_de_pago: detalle.Tipo_de_pago || detalle.metodoPago || 'No especificado'
      }));
      
      await DetalleTransaccion.bulkCreate(detallesConTransaccion);
    }
    
    // 3. Recargar la transacción completa para devolverla al frontend
    const transaccionCompleta = await Transaccion.findByPk(transaccion.id_transaccion, {
      include: [
        {
          model: TipoTransaccion,
          as: 'tipo_transaccion'
        },
        {
          model: DetalleTransaccion,
          as: 'detalles'
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Transacción creada exitosamente',
      data: transaccionCompleta
    });
  } catch (error) {
    console.error(error); // Agregado para ver errores en consola del servidor
    res.status(500).json({
      success: false,
      message: 'Error al crear transacción',
      error: error.message
    });
  }
};

export const getTransaccionesByFecha = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fecha_inicio y fecha_fin'
      });
    }
    
    const transacciones = await Transaccion.findAll({
      where: {
        fecha_asiento: {
          [Op.between]: [fecha_inicio, fecha_fin]
        }
      },
      include: [
        {
          model: TipoTransaccion,
          as: 'tipo_transaccion'
        },
        {
          model: DetalleTransaccion,
          as: 'detalles',
          // AGREGADO: También aquí para los reportes por fecha
          attributes: ['id_detalle', 'debe', 'haber', 'descripcion_detalle', 'es_cuenta_por_pagar', 'es_cuenta_por_cobrar', 'fecha_vencimiento', 'Tipo_de_pago']
        }
      ],
      order: [['fecha_asiento', 'ASC']]
    });
    
    res.json({
      success: true,
      data: transacciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacciones por fecha',
      error: error.message
    });
  }
};