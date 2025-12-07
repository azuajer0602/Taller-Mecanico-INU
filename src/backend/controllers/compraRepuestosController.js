import CompraRepuesto from '../models/CompraRepuesto.js';
import Repuesto from '../models/Repuesto.js';
import Proveedor from '../models/Proveedor.js';
import { Op } from 'sequelize';

const isNumeric = (value) => {
  if (value === null || value === undefined) return false;
  const strValue = String(value);
  return /^\d+(\.\d+)?$/.test(strValue) && !isNaN(parseFloat(strValue));
};

// 1. Obtener todas las compras de repuestos
export const obtenerComprasRepuestos = async (req, res) => {
  try {
    const compras = await CompraRepuesto.findAll({
      include: [
        {
          model: Repuesto,
          attributes: ['nombre_repuesto', 'desc_repuesto']
        },
        {
          model: Proveedor,
          attributes: ['nombre_fiscal', 'rif_juridico']
        }
      ],
      order: [['fecha_compra', 'DESC']]
    });

    if (compras.length === 0) {
      return res.status(404).json({ 
        message: 'No hay compras de repuestos registradas.' 
      });
    }

    res.status(200).json({
      message: 'Lista de compras obtenida exitosamente.',
      compras: compras,
      total: compras.length
    });

  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener compras.' 
    });
  }
};

// 2. Registrar nueva compra de repuesto
export const registrarCompraRepuesto = async (req, res) => {
  const { 
    precio_unitario_compra, 
    fecha_compra, 
    cantidad_comprada, 
    id_proveedor, 
    id_repuesto 
  } = req.body;

  // Validar campos requeridos
  const camposRequeridos = [
    'precio_unitario_compra',
    'fecha_compra',
    'cantidad_comprada',
    'id_proveedor',
    'id_repuesto'
  ];

  for (const campo of camposRequeridos) {
    if (!req.body[campo]) {
      return res.status(400).json({ 
        message: `El campo ${campo} es requerido.` 
      });
    }
  }

  // Validaciones numéricas
  if (!isNumeric(precio_unitario_compra)) {
    return res.status(400).json({ 
      message: 'El precio unitario debe ser numérico.' 
    });
  }

  if (!isNumeric(cantidad_comprada) || cantidad_comprada <= 0) {
    return res.status(400).json({ 
      message: 'La cantidad debe ser un número mayor a 0.' 
    });
  }

  if (!isNumeric(id_proveedor)) {
    return res.status(400).json({ 
      message: 'El ID del proveedor debe ser numérico.' 
    });
  }

  if (!isNumeric(id_repuesto)) {
    return res.status(400).json({ 
      message: 'El ID del repuesto debe ser numérico.' 
    });
  }

  // Validar formato de fecha (YYYY-MM-DD)
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!fechaRegex.test(fecha_compra)) {
    return res.status(400).json({ 
      message: 'Formato de fecha inválido. Use YYYY-MM-DD.' 
    });
  }

  try {
    // Verificar que exista el proveedor
    const proveedorExiste = await Proveedor.findByPk(id_proveedor);
    if (!proveedorExiste) {
      return res.status(404).json({ 
        message: 'El proveedor no existe.' 
      });
    }

    // Verificar que exista el repuesto
    const repuestoExiste = await Repuesto.findByPk(id_repuesto);
    if (!repuestoExiste) {
      return res.status(404).json({ 
        message: 'El repuesto no existe.' 
      });
    }

    // Crear la compra
    const nuevaCompra = await CompraRepuesto.create({
      precio_unitario_compra,
      fecha_compra,
      cantidad_comprada,
      id_proveedor,
      id_repuesto
    });

    // Actualizar el stock del repuesto
    await Repuesto.update(
      { 
        stock_inventario: repuestoExiste.stock_inventario + parseInt(cantidad_comprada),
        precio_unitario: precio_unitario_compra // Actualizar precio si es necesario
      },
      { where: { id_repuesto } }
    );

    // Obtener datos completos para respuesta
    const compraCompleta = await CompraRepuesto.findByPk(nuevaCompra.id_compra_repuesto, {
      include: [
        { model: Repuesto },
        { model: Proveedor }
      ]
    });

    res.status(201).json({
      message: 'Compra de repuesto registrada exitosamente',
      compra: compraCompleta,
      total_compra: precio_unitario_compra * cantidad_comprada
    });

  } catch (error) {
    console.error('Error al registrar compra:', error);
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        message: 'Error de integridad referencial. Verifique IDs.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error del servidor al registrar compra.' 
    });
  }
};

// 3. Eliminar compra de repuesto
export const eliminarCompraRepuesto = async (req, res) => {
  const { id_compra_repuesto } = req.body;

  if (!id_compra_repuesto || !isNumeric(id_compra_repuesto)) {
    return res.status(400).json({ 
      message: 'Se requiere un ID de compra numérico.' 
    });
  }

  try {
    // Buscar la compra para obtener datos necesarios (repuesto y cantidad)
    const compra = await CompraRepuesto.findByPk(id_compra_repuesto);
    
    if (!compra) {
      return res.status(404).json({ 
        message: 'Compra no encontrada.' 
      });
    }

    // Actualizar stock del repuesto (revertir la compra)
    const repuesto = await Repuesto.findByPk(compra.id_repuesto);
    if (repuesto) {
      const nuevoStock = repuesto.stock_inventario - compra.cantidad_comprada;
      if (nuevoStock < 0) {
        return res.status(400).json({ 
          message: 'No se puede eliminar la compra. Stock insuficiente.' 
        });
      }
      
      await Repuesto.update(
        { stock_inventario: nuevoStock },
        { where: { id_repuesto: compra.id_repuesto } }
      );
    }

    // Eliminar la compra
    const count = await CompraRepuesto.destroy({
      where: {
        id_compra_repuesto: id_compra_repuesto
      }
    });

    if (count === 0) {
      return res.status(404).json({ 
        message: 'Compra no encontrada.' 
      });
    }

    res.status(200).json({ 
      message: 'Compra eliminada exitosamente y stock actualizado.',
      repuesto_afectado: {
        id_repuesto: compra.id_repuesto,
        stock_actualizado: repuesto ? repuesto.stock_inventario - compra.cantidad_comprada : 'N/A'
      }
    });

  } catch (error) {
    console.error('Error al eliminar compra:', error);
    res.status(500).json({ 
      message: 'Error del servidor al eliminar compra.' 
    });
  }
};

// 4. Actualizar compra de repuesto
export const actualizarCompraRepuesto = async (req, res) => {
  const { 
    id_compra_repuesto,
    precio_unitario_compra,
    fecha_compra,
    cantidad_comprada,
    id_proveedor,
    id_repuesto
  } = req.body;

  if (!id_compra_repuesto || !isNumeric(id_compra_repuesto)) {
    return res.status(400).json({ 
      message: 'Se requiere un ID de compra numérico.' 
    });
  }

  const updateData = {};

  if (precio_unitario_compra !== undefined) {
    if (!isNumeric(precio_unitario_compra)) {
      return res.status(400).json({ 
        message: 'El precio unitario debe ser numérico.' 
      });
    }
    updateData.precio_unitario_compra = precio_unitario_compra;
  }

  if (fecha_compra) {
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha_compra)) {
      return res.status(400).json({ 
        message: 'Formato de fecha inválido. Use YYYY-MM-DD.' 
      });
    }
    updateData.fecha_compra = fecha_compra;
  }

  if (cantidad_comprada !== undefined) {
    if (!isNumeric(cantidad_comprada) || cantidad_comprada <= 0) {
      return res.status(400).json({ 
        message: 'La cantidad debe ser un número mayor a 0.' 
      });
    }
    updateData.cantidad_comprada = cantidad_comprada;
  }

  if (id_proveedor !== undefined) {
    if (!isNumeric(id_proveedor)) {
      return res.status(400).json({ 
        message: 'El ID del proveedor debe ser numérico.' 
      });
    }
    // Verificar que exista el proveedor
    const proveedorExiste = await Proveedor.findByPk(id_proveedor);
    if (!proveedorExiste) {
      return res.status(404).json({ 
        message: 'El proveedor no existe.' 
      });
    }
    updateData.id_proveedor = id_proveedor;
  }

  if (id_repuesto !== undefined) {
    if (!isNumeric(id_repuesto)) {
      return res.status(400).json({ 
        message: 'El ID del repuesto debe ser numérico.' 
      });
    }
    // Verificar que exista el repuesto
    const repuestoExiste = await Repuesto.findByPk(id_repuesto);
    if (!repuestoExiste) {
      return res.status(404).json({ 
        message: 'El repuesto no existe.' 
      });
    }
    updateData.id_repuesto = id_repuesto;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ 
      message: 'No se proporcionaron datos para actualizar.' 
    });
  }

  try {
    // Verificar si existe la compra
    const compraExistente = await CompraRepuesto.findByPk(id_compra_repuesto);
    if (!compraExistente) {
      return res.status(404).json({ 
        message: 'Compra no encontrada.' 
      });
    }

    // Si se cambia la cantidad, actualizar stock
    if (cantidad_comprada !== undefined && compraExistente.id_repuesto) {
      const repuesto = await Repuesto.findByPk(compraExistente.id_repuesto);
      if (repuesto) {
        const diferenciaCantidad = cantidad_comprada - compraExistente.cantidad_comprada;
        const nuevoStock = repuesto.stock_inventario + diferenciaCantidad;
        
        if (nuevoStock < 0) {
          return res.status(400).json({ 
            message: 'Stock insuficiente para realizar esta actualización.' 
          });
        }
        
        await Repuesto.update(
          { stock_inventario: nuevoStock },
          { where: { id_repuesto: compraExistente.id_repuesto } }
        );
      }
    }

    // Actualizar la compra
    const [updatedRowsCount] = await CompraRepuesto.update(updateData, {
      where: {
        id_compra_repuesto: id_compra_repuesto
      }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ 
        message: 'Compra no encontrada o no hubo cambios.' 
      });
    }

    // Obtener la compra actualizada
    const compraActualizada = await CompraRepuesto.findByPk(id_compra_repuesto, {
      include: [
        { model: Repuesto },
        { model: Proveedor }
      ]
    });

    res.status(200).json({
      message: 'Compra actualizada exitosamente.',
      compra: compraActualizada
    });

  } catch (error) {
    console.error('Error al actualizar compra:', error);
    res.status(500).json({ 
      message: 'Error del servidor al actualizar compra.' 
    });
  }
};

// 5. Obtener compra por ID
export const obtenerCompraPorId = async (req, res) => {
  const { id } = req.params;

  if (!id || !isNumeric(id)) {
    return res.status(400).json({ 
      message: 'Se requiere un ID numérico.' 
    });
  }

  try {
    const compra = await CompraRepuesto.findByPk(id, {
      include: [
        {
          model: Repuesto,
          attributes: ['nombre_repuesto', 'desc_repuesto', 'stock_inventario']
        },
        {
          model: Proveedor,
          attributes: ['nombre_fiscal', 'rif_juridico', 'telefono_proveedor']
        }
      ]
    });

    if (!compra) {
      return res.status(404).json({ 
        message: 'Compra no encontrada.' 
      });
    }

    res.status(200).json({
      message: 'Compra obtenida exitosamente.',
      compra: compra,
      total: compra.precio_unitario_compra * compra.cantidad_comprada
    });

  } catch (error) {
    console.error('Error al obtener compra:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener compra.' 
    });
  }
};