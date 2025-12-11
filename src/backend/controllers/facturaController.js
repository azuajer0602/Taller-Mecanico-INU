import database from '../config/database.js';
const { sequelize } = database;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

// IMPORTAR MODELOS
import Cliente from '../models/Cliente.js';
import Factura from '../models/Factura.js';
import ItemFactura from '../models/ItemFactura.js';
import Servicio from '../models/Servicio.js';
import Repuesto from '../models/Repuesto.js';
import Transaccion from '../models/Transaccion.js';
import DetalleTransaccion from '../models/DetalleTransaccion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invoicesDir = path.join(__dirname, '..', 'public', 'invoices');
const logoPath = path.join(__dirname, '..', '..', 'assets', 'logo.png');

export const facturaController = {

  // 1. CREAR FACTURA
  async create(req, res) {
    const t = await sequelize.transaction(); 
    try {
      const { cliente, factura, items, id_servicio } = req.body;

      if (!cliente || !factura || !items || items.length === 0) {
        throw new Error('Datos incompletos.');
      }

      // --- CLIENTE ---
      let clienteGuardado;
      if (cliente.id_cliente) {
        clienteGuardado = await Cliente.findByPk(cliente.id_cliente, { transaction: t });
        await clienteGuardado.update({
            nombre: cliente.nombre, apellido: cliente.apellido,
            direccion: cliente.direccion, telefono: cliente.telefono, correo: cliente.correo
        }, { transaction: t });
      } else {
        clienteGuardado = await Cliente.create(cliente, { transaction: t });
      }

      // --- FACTURA ---
      const nuevaFactura = await Factura.create({
        ClienteId: clienteGuardado.id_cliente,
        fechaPago: factura.fechaPago,
        total: factura.total,
        estado: factura.estado,
        metodoPago: factura.metodoPago,
      }, { transaction: t });

      // --- ITEMS Y STOCK ---
      const itemsParaGuardar = [];
      let totalRepuestos = 0;
      let totalServicios = 0;

      for (const item of items) {
          const subtotal = parseFloat(item.cantidad) * parseFloat(item.precio);
          
          itemsParaGuardar.push({
              descripcion: item.descripcion,
              cantidad: item.cantidad,
              precio: item.precio,
              FacturaId: nuevaFactura.id
          });

          if (item.id_repuesto) {
              totalRepuestos += subtotal;
              const repuesto = await Repuesto.findByPk(item.id_repuesto, { transaction: t });
              if (repuesto) {
                  if (repuesto.stock_inventario < item.cantidad) {
                      throw new Error(`Stock insuficiente para: ${repuesto.nombre_repuesto}`);
                  }
                  await repuesto.decrement('stock_inventario', { by: item.cantidad, transaction: t });
              }
          } else {
              totalServicios += subtotal;
          }
      }
      
      await ItemFactura.bulkCreate(itemsParaGuardar, { transaction: t });

      // --- SERVICIO ---
      if (id_servicio) {
          const servicio = await Servicio.findByPk(id_servicio, { transaction: t });
          if (servicio) {
              servicio.entrega = 'Entregado';
              servicio.fecha_salida = new Date();
              await servicio.save({ transaction: t });
          }
      }

      // =================================================================================
      // --- CONTABILIDAD ---
      // =================================================================================
      
      // 1. Cabecera Transacción
      // ID 22 (Venta Mercancía) como genérico de la operación
      const nuevaTrx = await Transaccion.create({
          fecha_asiento: new Date(),
          descripcion_asiento: `Factura #${nuevaFactura.id} - ${clienteGuardado.nombre} ${clienteGuardado.apellido}`,
          id_tipo_transaccion_fk: 22 
      }, { transaction: t });

      // 2. Determinar cuenta del DEBE (Destino del dinero)
      let idCuentaDebe = 0;
      let descDebe = '';

      if (factura.estado === 'Pagado') {
          const esBanco = ['Pago Móvil', 'Punto de Venta', 'Transferencia'].includes(factura.metodoPago);
          if (esBanco) {
              idCuentaDebe = 3; // Banco
              descDebe = `Ingreso Banco (${factura.metodoPago})`;
          } else {
              idCuentaDebe = 2; // Caja
              descDebe = `Ingreso Caja (${factura.metodoPago})`;
          }
      } else {
          idCuentaDebe = 37; // Cuentas por Cobrar
          descDebe = `CxC Cliente: ${clienteGuardado.nombre}`;
      }

      // 3. Registrar el DEBE
      await DetalleTransaccion.create({
          id_transaccion: nuevaTrx.id_transaccion,
          id_tipo_transaccion_fk: idCuentaDebe, // <--- CORRECCIÓN: Aquí pasamos el ID que faltaba (2, 3 o 37)
          descripcion_detalle: descDebe,
          debe: factura.total, 
          haber: 0,
          es_cuenta_por_cobrar: factura.estado === 'Pendiente' ? 1 : 0,
          es_cuenta_por_pagar: 0,
          fecha_vencimiento: factura.estado === 'Pendiente' ? new Date(Date.now() + 30*24*60*60*1000) : null,
          Tipo_de_pago: factura.metodoPago
      }, { transaction: t });

      // 4. Registrar el HABER (Origen del ingreso)
      
      // A. Por Repuestos
      if (totalRepuestos > 0) {
          await DetalleTransaccion.create({
              id_transaccion: nuevaTrx.id_transaccion,
              id_tipo_transaccion_fk: 22, // <--- CORRECCIÓN: ID 22 (Venta Mercancía)
              descripcion_detalle: 'Ingreso por Venta de Repuestos',
              debe: 0,
              haber: totalRepuestos,
              es_cuenta_por_cobrar: 0, es_cuenta_por_pagar: 0, Tipo_de_pago: 'N/A'
          }, { transaction: t });
      }

      // B. Por Servicios
      if (totalServicios > 0) {
          await DetalleTransaccion.create({
              id_transaccion: nuevaTrx.id_transaccion,
              id_tipo_transaccion_fk: 23, // <--- CORRECCIÓN: ID 23 (Servicios Profesionales)
              descripcion_detalle: 'Ingreso por Servicios Mecánicos',
              debe: 0,
              haber: totalServicios,
              es_cuenta_por_cobrar: 0, es_cuenta_por_pagar: 0, Tipo_de_pago: 'N/A'
          }, { transaction: t });
      }

      await t.commit();

      res.status(201).json({
        success: true,
        message: 'Factura procesada correctamente.',
        data: { id: nuevaFactura.id }
      });

    } catch (error) {
      await t.rollback();
      console.error('Error Facturación:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 2. GENERAR PDF
  async generatePdf(req, res) {
    try {
      const { id } = req.params;
      const factura = await Factura.findByPk(id, {
        include: [{ model: Cliente, as: 'Cliente' }, { model: ItemFactura, as: 'ItemFacturas' }]
      });

      if (!factura) return res.status(404).json({ success: false, message: 'No encontrada' });

      if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

      const fileName = `Factura_${factura.id}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 45, { width: 80 });
      
      doc.fontSize(20).text('FACTURA', 400, 50, { align: 'right' });
      doc.fontSize(10).text(`#${factura.id}`, 400, 75, { align: 'right' });
      
      doc.text(`Cliente: ${factura.Cliente.nombre} ${factura.Cliente.apellido}`, 50, 130);
      doc.text(`CI/RIF: ${factura.Cliente.cedula}`, 50, 145);
      doc.text(`Fecha: ${new Date(factura.fechaPago).toLocaleDateString()}`, 400, 130, { align: 'right' });
      
      let y = 200;
      doc.rect(50, y, 500, 20).fill('#eee').stroke();
      doc.fillColor('#000').text('Descripción', 60, y+5);
      doc.text('Cant', 320, y+5);
      doc.text('Precio', 380, y+5);
      doc.text('Total', 460, y+5);
      
      y += 25;
      const moneda = factura.metodoPago === 'Divisas' ? '$' : 'Bs';

      factura.ItemFacturas.forEach(item => {
          const totalItem = parseFloat(item.cantidad) * parseFloat(item.precio);
          doc.text(item.descripcion, 60, y);
          doc.text(item.cantidad, 320, y);
          doc.text(`${moneda} ${item.precio}`, 380, y);
          doc.text(`${moneda} ${totalItem.toFixed(2)}`, 460, y);
          y += 20;
      });
      
      doc.fontSize(14).text(`TOTAL: ${moneda} ${factura.total}`, 400, y+20, { align: 'right', bold: true });
      doc.fontSize(10).text(`Método: ${factura.metodoPago}`, 50, y+20);
      doc.text(`Estado: ${factura.estado}`, 50, y+35);

      doc.end();

      writeStream.on('finish', () => {
        res.json({ success: true, url: `/invoices/${fileName}` });
      });

    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, message: e.message });
    }
  },

  // 3. OTROS MÉTODOS
  async findAll(req, res) {
      try {
        const facturas = await Factura.findAll({ include: ['Cliente'], order: [['id', 'DESC']] });
        res.json({ success: true, data: facturas });
      } catch (e) {
        res.status(500).json({message: e.message});
      }
  },

  async findById(req, res) {
      try {
        const f = await Factura.findByPk(req.params.id, { include: ['Cliente', 'ItemFacturas'] });
        if(!f) return res.status(404).json({message: 'No existe'});
        res.json({ success: true, data: f });
      } catch (e) {
        res.status(500).json({message: e.message});
      }
  },

  async update(req, res) { /* ... */ },
  async delete(req, res) { /* ... */ }
};