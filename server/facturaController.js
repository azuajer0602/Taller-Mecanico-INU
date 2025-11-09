const { sequelize, Cliente, Factura, ItemFactura } = require('./models');
const { Op } = require('sequelize');

// Obtener todas las facturas con sus detalles
exports.obtenerFacturas = async (req, res) => {
  try {
    const { fecha } = req.query;
    let whereClause = {};

    if (fecha) {
      whereClause.fechaPago = { [Op.eq]: fecha };
    }

    const facturas = await Factura.findAll({
      where: whereClause,
      include: [
        { model: Cliente, attributes: ['nombre', 'apellido', 'cedula'] },
        { model: ItemFactura, attributes: ['descripcion', 'cantidad', 'precio'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
};

// Crear una nueva factura
exports.crearFactura = async (req, res) => {
  // Usamos una transacción para asegurar que todo se guarde correctamente
  const t = await sequelize.transaction();

  try {
    const { cliente, pago, productos, totalFactura } = req.body;

    if (!cliente || !cliente.cedula || !cliente.nombre || !cliente.apellido || !cliente.correo) {
      return res.status(400).json({ msg: 'Los datos del cliente (nombre, apellido, cédula, correo) son obligatorios.' });
    }
    if (!pago || !pago.fechaPago || !pago.metodoPago) {
      return res.status(400).json({ msg: 'Los detalles del pago son obligatorios.' });
    }
    if (!productos || productos.length === 0) {
      return res.status(400).json({ msg: 'La factura debe tener al menos un producto o servicio.' });
    }

    // 1. Buscar o crear el cliente
    const [clienteDB, creado] = await Cliente.findOrCreate({
      where: { cedula: cliente.cedula },
      defaults: cliente,
      transaction: t
    });

    const nuevaFactura = await Factura.create({
      clienteId: clienteDB.id,
      fechaPago: pago.fechaPago,
      estado: pago.estado,
      metodoPago: pago.metodoPago,
      total: totalFactura
    }, { transaction: t });

    // 3. Crear los items de la factura
    const itemsParaCrear = productos.map(item => ({
      ...item,
      facturaId: nuevaFactura.id
    }));

    await ItemFactura.bulkCreate(itemsParaCrear, { transaction: t });

    await t.commit();

    res.status(201).json({ msg: 'Factura creada exitosamente', facturaId: nuevaFactura.id });

  } catch (error) {
    // Si algo falló, revertimos todos los cambios
    await t.rollback();
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ msg: 'Error de unicidad: ' + error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).send('Error en el servidor al crear la factura.');
  }
};

// Actualizar el estado de una factura (Pagado/Pendiente)
exports.actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!['Pagado', 'Pendiente'].includes(estado)) {
      return res.status(400).json({ msg: 'Estado no válido.' });
    }

    const factura = await Factura.findByPk(req.params.id);
    if (!factura) {
      return res.status(404).json({ msg: 'Factura no encontrada.' });
    }

    factura.estado = estado;
    await factura.save();

    res.json({ msg: 'Estado de la factura actualizado.', factura });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor.');
  }
};

exports.anularFactura = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.id);
    if (!factura) {
      return res.status(404).json({ msg: 'Factura no encontrada.' });
    }
    factura.estado = 'Anulada';
    await factura.save();
    res.json({ msg: 'Factura anulada correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor.');
  }
};