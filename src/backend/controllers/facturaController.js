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

        // --- Configuración de Directorios y Archivos ---
        if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

        const fileName = `Factura_${factura.id}.pdf`;
        const filePath = path.join(invoicesDir, fileName);
        
        // --- Configuración del Documento PDF ---
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // --- Constantes de Estilo ---
        const primaryColor = '#4e73df'; // Azul moderno
        const secondaryColor = '#f2f2f2'; // Gris claro para fondo de tabla
        const textColor = '#333333'; // Gris oscuro para el texto
        const yStart = 200; // Posición Y inicial para la tabla
        const tableWidth = 500;
        const xPos = 50;

        // --- 1. Encabezado y Logo ---
        doc.fillColor(textColor);

        // Logo (si existe)
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, xPos, 50, { width: 80 });
        } else {
            // Si no hay logo, poner un nombre de empresa
            doc.fontSize(16).text('Nombre de tu Empresa', xPos, 60);
        }

        // Título de Factura
        doc.fillColor(primaryColor)
           .fontSize(24)
           .text('FACTURA', 400, 50, { align: 'right' });
           
        // Número de Factura
        doc.fillColor(textColor)
           .fontSize(12)
           .text(`Nº: ${factura.id}`, 400, 80, { align: 'right' });
        
        doc.moveDown(); // Espacio después del encabezado
        
        // --- 2. Información de la Empresa (Simulado, asumiendo que debe ir cerca del logo) ---
        doc.fontSize(10)
           .text('Dirección de la Empresa, Ciudad, País', xPos, 110)
           .text('Teléfono: 0123-456789', xPos, 125)
           .text('Email: contacto@empresa.com', xPos, 140);

        // Línea separadora
        doc.strokeColor(primaryColor)
           .lineWidth(1)
           .moveTo(xPos, 170)
           .lineTo(xPos + tableWidth, 170)
           .stroke();

        // --- 3. Información del Cliente y Fecha ---
        doc.fillColor(textColor).fontSize(10);
        
        // Columna Izquierda (Cliente)
        doc.text('FACTURAR A:', xPos, yStart - 20)
           .font('Helvetica-Bold')
           .text(`${factura.Cliente.nombre} ${factura.Cliente.apellido}`, xPos, yStart);
        
        doc.font('Helvetica')
           .text(`CI/RIF: ${factura.Cliente.cedula}`, xPos, yStart + 15)
           .text(`Dirección: ${factura.Cliente.direccion || 'No especificada'}`, xPos, yStart + 30); // Añadida dirección (asumiendo que existe)

        // Columna Derecha (Datos de Factura)
        doc.text('FECHA DE EMISIÓN:', 400, yStart)
           .font('Helvetica-Bold')
           .text(new Date(factura.fechaPago).toLocaleDateString(), 400, yStart + 15);

        doc.moveDown(3);

        // --- 4. Tabla de Ítems de Factura ---
        let y = yStart + 70;
        const itemHeight = 20;
        const moneda = factura.metodoPago === 'Divisas' ? '$' : 'Bs';

        // Encabezados de la Tabla
        doc.fillColor(primaryColor)
           .rect(xPos, y, tableWidth, itemHeight).fill(primaryColor)
           .fillColor('#ffffff') // Texto blanco para los encabezados
           .font('Helvetica-Bold')
           .text('Descripción', xPos + 10, y + 5)
           .text('Cant', 300, y + 5)
           .text('Precio Unit.', 380, y + 5)
           .text('Total', 460, y + 5, { align: 'right', width: 40 }); // Alineación a la derecha

        y += itemHeight;

        // Ítems
        doc.font('Helvetica').fillColor(textColor);
        let itemsTotal = 0; // Para calcular la suma total

        factura.ItemFacturas.forEach((item, index) => {
            const totalItem = parseFloat(item.cantidad) * parseFloat(item.precio);
            itemsTotal += totalItem;

            // Fondo alternado para filas (mejora visual)
            if (index % 2 === 0) {
                 doc.fillColor(secondaryColor).rect(xPos, y, tableWidth, itemHeight).fill(secondaryColor);
                 doc.fillColor(textColor);
            } else {
                doc.fillColor('#ffffff').rect(xPos, y, tableWidth, itemHeight).fill('#ffffff');
                doc.fillColor(textColor);
            }
            
            doc.text(item.descripcion, xPos + 10, y + 5, { width: 220 })
               .text(item.cantidad, 300, y + 5)
               .text(`${moneda} ${parseFloat(item.precio).toFixed(2)}`, 380, y + 5)
               .text(`${moneda} ${totalItem.toFixed(2)}`, 460, y + 5, { align: 'right', width: 40 });

            y += itemHeight;
        });

        // Asegurar el espacio para la siguiente sección
        doc.moveDown(2);
        
        // --- 5. Totales y Resumen ---
        
        // Fondo gris para el área de totales
        const totalAreaY = y + 10;
        const totalAreaHeight = 60;
        
        doc.fillColor(secondaryColor)
           .rect(300, totalAreaY, 250, totalAreaHeight).fill(secondaryColor);

        // Subtotal (asumiendo que el total de la factura ya considera impuestos si aplica)
        // Usamos el total calculado para mayor seguridad, o el total de la DB si es más preciso.
        const totalDisplay = parseFloat(factura.total).toFixed(2);
        
        doc.fillColor(textColor)
           .font('Helvetica')
           .fontSize(10)
           .text('Subtotal:', 320, totalAreaY + 10)
           .text(`${moneda} ${itemsTotal.toFixed(2)}`, 420, totalAreaY + 10, { align: 'right', width: 120 });
        
        // TOTAL FINAL - Resaltado
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .fontSize(16)
           .text('TOTAL A PAGAR:', 320, totalAreaY + 35)
           .text(`${moneda} ${totalDisplay}`, 420, totalAreaY + 35, { align: 'right', width: 120 });

        // Información adicional
        doc.fillColor(textColor)
           .font('Helvetica')
           .fontSize(10)
           .text(`Método de Pago: ${factura.metodoPago}`, xPos, totalAreaY + 10)
           .text(`Estado: ${factura.estado}`, xPos, totalAreaY + 25);
        
        // --- 6. Pie de Página (Notas) ---
        const footerY = 750;
        doc.fillColor(textColor)
           .fontSize(8)
           .text('GRACIAS POR SU COMPRA.', xPos, footerY);
           
        doc.fillColor(primaryColor)
           .fontSize(8)
           .text('Términos y Condiciones: Esta factura debe ser pagada en un plazo de 30 días.', xPos, footerY + 15);
           
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