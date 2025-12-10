import database from '../config/database.js';
const { sequelize } = database;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import Cliente from '../models/Cliente.js';
import Factura from '../models/Factura.js';
import ItemFactura from '../models/ItemFactura.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invoicesDir = path.join(__dirname, '..', 'public', 'invoices');
// Asumimos que el logo está en la carpeta 'src/assets'
const logoPath = path.join(__dirname, '..', '..', 'assets', 'logo.png');

export const facturaController = {

  // POST /api/facturas - Crear una nueva factura completa (Cliente, Factura, Items)
  async create(req, res) {
    const t = await sequelize.transaction();
    try {
      const { cliente, factura, items } = req.body;

      // --- 1. Validaciones ---
      if (!cliente || !factura || !items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Datos incompletos para crear la factura.' });
      }

      // --- 2. Manejar Cliente (Crear o Actualizar) ---
      let clienteGuardado;
      if (cliente.id_cliente) {
        // Si el cliente ya existe, lo buscamos
        clienteGuardado = await Cliente.findByPk(cliente.id_cliente);
        if (!clienteGuardado) {
            throw new Error(`El cliente con ID ${cliente.id_cliente} no fue encontrado.`);
        }
      } else {
        // Si no existe, lo creamos
        clienteGuardado = await Cliente.create({
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          cedula: cliente.cedula,
          correo: cliente.correo,
          direccion: cliente.direccion,
          telefono: cliente.telefono,
        }, { transaction: t });
      }

      // --- 3. Crear Factura ---
      const nuevaFactura = await Factura.create({
        ClienteId: clienteGuardado.id_cliente,
        fechaPago: factura.fechaPago,
        total: factura.total,
        estado: factura.estado,
        metodoPago: factura.metodoPago,
      }, { transaction: t });

      // --- 4. Crear Items de la Factura ---
      const itemsParaGuardar = items.map(item => ({
        ...item,
        FacturaId: nuevaFactura.id,
      }));

      await ItemFactura.bulkCreate(itemsParaGuardar, { transaction: t });

      // --- 5. Confirmar Transacción ---
      await t.commit();

      res.status(201).json({
        success: true,
        message: 'Factura creada exitosamente.',
        data: {
          id: nuevaFactura.id,
          ...factura,
          cliente: clienteGuardado
        }
      });

    } catch (error) {
      await t.rollback();
      console.error('Error al crear la factura:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor al crear la factura.', error: error.message });
    }
  },

  // GET /api/facturas - Obtener todas las facturas
  async findAll(req, res) {
    try {
      const facturas = await Factura.findAll({
        include: [
          {
            model: Cliente,
            as: 'Cliente',
            attributes: ['id_cliente', 'nombre', 'apellido', 'cedula', 'correo', 'telefono']
          },
          {
            model: ItemFactura,
            as: 'ItemFacturas',
            attributes: ['id', 'descripcion', 'cantidad', 'precio']
          }
        ],
        order: [['fechaPago', 'DESC']],
      });

      res.json({ success: true, data: facturas });
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor al obtener facturas.', error: error.message });
    }
  },

  // GET /api/facturas/:id - Obtener una factura por ID
  async findById(req, res) {
    try {
      const { id } = req.params;
      const factura = await Factura.findByPk(id, {
        include: [
          {
            model: Cliente,
            as: 'Cliente',
            attributes: ['nombre', 'apellido', 'cedula', 'correo', 'telefono']
          },
          {
            model: ItemFactura,
            as: 'ItemFacturas',
            attributes: ['descripcion', 'cantidad', 'precio']
          }
        ]
      });

      if (!factura) {
        return res.status(404).json({ success: false, message: 'Factura no encontrada.' });
      }

      res.json({ success: true, data: factura });
    } catch (error) {
      console.error(`Error al obtener factura ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Error interno del servidor.', error: error.message });
    }
  },

  // PATCH /api/facturas/:id - Actualizar una factura (ej. cambiar estado)
  async update(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado) {
        return res.status(400).json({ success: false, message: 'No se proporcionó un estado para actualizar.' });
      }

      const factura = await Factura.findByPk(id);

      if (!factura) {
        return res.status(404).json({ success: false, message: 'Factura no encontrada.' });
      }

      factura.estado = estado;
      await factura.save({ transaction: t });

      await t.commit();

      res.json({ success: true, message: 'Factura actualizada exitosamente.', data: factura });

    } catch (error) {
      await t.rollback();
      console.error(`Error al actualizar factura ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Error interno del servidor al actualizar.', error: error.message });
    }
  },

  // POST /api/facturas/:id/pdf - Generar y guardar PDF, actualizar ruta en BD
  async generatePdf(req, res) {
    try {
      const { id } = req.params;
      const factura = await Factura.findByPk(id, {
        include: [
          { model: Cliente, as: 'Cliente' },
          { model: ItemFactura, as: 'ItemFacturas' }
        ]
      });

      if (!factura) {
        return res.status(404).json({ success: false, message: 'Factura no encontrada.' });
      }

      // Asegurar directorio
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const safeName = `${factura.Cliente.nombre}_${factura.Cliente.apellido}`.replace(/[^a-zA-Z0-9_\-]/g, '_');
      const fileName = `Factura_${factura.id}_${safeName}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      // --- INICIO DE LA CREACIÓN DEL PDF CON DISEÑO MEJORADO ---
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- Colores y Fuentes ---
      const primaryColor = '#0D6EFD'; // Azul Bootstrap
      const secondaryColor = '#6C757D'; // Gris Bootstrap
      const tableHeaderBg = '#F2F2F2';
      const tableBorderColor = '#DDDDDD';

      // --- Encabezado del PDF ---
      const headerY = 50;
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, headerY, { width: 100 });
      }
      doc.fillColor(primaryColor).fontSize(20).text('MECANOSOFT', 200, headerY + 15, { align: 'right' });
      doc.fillColor(secondaryColor).fontSize(10).text('Servicio de Reparación de Vehículos', 200, headerY + 40, { align: 'right' });

      // --- Información de la Factura ---
      const infoY = headerY + 80;
      doc.fillColor('#000').fontSize(20).text('FACTURA', 50, infoY);
      doc.strokeColor(primaryColor).lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1.5);

      const customerInfoY = doc.y;
      doc.fontSize(10).fillColor(secondaryColor).text('FACTURAR A:', 50, customerInfoY);
      doc.fillColor('#000').fontSize(12).text(`${factura.Cliente.nombre} ${factura.Cliente.apellido}`, 50, customerInfoY + 15)
        .fontSize(10).text(`C.I: ${factura.Cliente.cedula}`)
        .text(factura.Cliente.correo)
        .text(factura.Cliente.telefono);

      doc.fontSize(10).fillColor(secondaryColor).text('Nº FACTURA:', 400, customerInfoY);
      doc.fillColor('#000').fontSize(12).text(factura.id, 400, customerInfoY + 15, { align: 'right' });

      doc.fontSize(10).fillColor(secondaryColor).text('FECHA:', 400, customerInfoY + 35);
      doc.fillColor('#000').fontSize(12).text(new Date(factura.fechaPago).toLocaleDateString(), 400, customerInfoY + 50, { align: 'right' });

      doc.y = customerInfoY + 80; // Mover hacia abajo para la tabla

      // --- Tabla de Items ---
      const tableTop = doc.y;
      const monedaSimbolo = factura.metodoPago === 'Divisas' ? '$' : 'Bs';
      const itemX = 50;
      const qtyX = 320;
      const priceX = 380;
      const totalX = 460;

      // Función para dibujar fila de la tabla
      function drawTableRow(y, c1, c2, c3, c4, isHeader = false) {
        doc.fontSize(isHeader ? 10 : 9);
        if (isHeader) {
          doc.fillColor('#000').font('Helvetica-Bold');
        } else {
          doc.fillColor(secondaryColor).font('Helvetica');
        }
        doc.text(c1, itemX, y, { width: 260 });
        doc.text(c2, qtyX, y, { width: 50, align: 'center' });
        doc.text(c3, priceX, y, { width: 70, align: 'right' });
        doc.text(c4, totalX, y, { width: 80, align: 'right' });
      }

      // Dibujar encabezado de la tabla
      doc.rect(50, tableTop, 500, 20).fill(tableHeaderBg);
      drawTableRow(tableTop + 6, 'Descripción', 'Cantidad', 'Precio Unitario', 'Subtotal', true);

      let y = tableTop + 25;
      // Dibujar filas de items
      factura.ItemFacturas.forEach(item => {
        const subtotal = Number(item.cantidad) * Number(item.precio);
        drawTableRow(
          y,
          item.descripcion,
          String(item.cantidad),
          `${monedaSimbolo} ${Number(item.precio).toFixed(2)}`,
          `${monedaSimbolo} ${subtotal.toFixed(2)}`
        );
        y += 20;
        doc.strokeColor(tableBorderColor).moveTo(50, y - 5).lineTo(550, y - 5).stroke();
      });

      // --- Totales ---
      const totalY = y + 10;
      doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor);
      doc.text('TOTAL:', 350, totalY, { align: 'right', width: 100 });
      doc.text(`${monedaSimbolo} ${Number(factura.total).toFixed(2)}`, 450, totalY, { align: 'right', width: 90 });

      doc.moveDown(2);
      doc.font('Helvetica').fontSize(10).fillColor(secondaryColor);
      doc.text(`Método de Pago: ${factura.metodoPago}`, { align: 'right' });
      doc.text(`Estado: ${factura.estado}`, { align: 'right' });

      // --- Pie de Página ---
      doc.fontSize(8).fillColor(secondaryColor).text('¡Gracias por su confianza!', 50, 750, { align: 'center', width: 500 });
      doc.text('Mecanosoft - RIF: J-12345678-9 - Teléfono: (0412) 123-4567', 50, 760, { align: 'center', width: 500 });

      doc.end();
      // --- FIN DE LA CREACIÓN DEL PDF ---

      writeStream.on('finish', async () => {
        const publicUrl = `/invoices/${fileName}`;
        factura.pdfPath = publicUrl;
        await factura.save();
        res.json({ success: true, message: 'PDF generado y guardado correctamente.', url: publicUrl });
      });

      writeStream.on('error', (err) => {
        console.error('Error escribiendo PDF:', err);
        res.status(500).json({ success: false, message: 'No se pudo generar el PDF.' });
      });

    } catch (error) {
      console.error('Error al generar PDF:', error);
      res.status(500).json({ success: false, message: 'Error interno al generar PDF.', error: error.message });
    }
  },

  // DELETE /api/facturas/:id - Eliminar una factura (anulación lógica)
  // Por seguridad, en lugar de borrar, la marcamos como "Anulada"
  async delete(req, res) {
      return this.update(req, res);
  }
};
