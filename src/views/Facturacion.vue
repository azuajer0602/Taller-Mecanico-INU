<template>
  <div class="container mt-4">
    <div class="card shadow">
      <div class="card-header bg-primary text-white">
        <h1 class="mb-0 h3">
          <i class="bi bi-receipt-cutoff me-2"></i>Módulo de Facturación
        </h1>
      </div>

      <div class="card-body">
        <form @submit.prevent="generarPDF" class="factura-form">
          <!-- DATOS DEL CLIENTE -->
          <div class="form-section border-start border-4 border-success ps-3 mb-4">
            <h3 class="h5">Datos del Cliente</h3>
            <div class="row">
              <div class="col-md-6 mb-3" v-for="(campo, key) in camposCliente" :key="key">
                <label :for="key" class="form-label">{{ campo.label }}:</label>
                <input
                  :id="key"
                  v-model="cliente[key]"
                  :type="campo.type"
                  class="form-control"
                />
              </div>
            </div>
          </div>

          <div class="form-section border-start border-4 border-info ps-3 mb-4">
            <h3 class="h5">Detalles del Pago</h3>
            <div class="row">
              <div class="col-md-4 mb-3">
                <label for="fechaPago" class="form-label">Fecha de Pago:</label>
                <input id="fechaPago" v-model="pago.fechaPago" type="date" class="form-control" />
              </div>
              <div class="col-md-4 mb-3">
                <label for="estado" class="form-label">Estado:</label>
                <select id="estado" v-model="pago.estado" class="form-select">
                  <option>Pagado</option>
                  <option>Pendiente</option>
                </select>
              </div>
              <div class="col-md-4 mb-3">
                <label for="metodoPago" class="form-label"><i class="bi bi-credit-card-2-front-fill me-1"></i>Método de Pago:</label>
                <select id="metodoPago" v-model="pago.metodoPago" class="form-select">
                  <option>Bolivares</option>
                  <option>Divisas</option>
                  <option>Pago Móvil</option>
                  <option>Punto de Venta</option>
                </select>
              </div>
            </div>
          </div>

          
          <div class="form-section border-start border-4 border-warning ps-3 mb-4">
            <h3 class="h5">Detalles de Productos/Servicios</h3>
            <div v-for="(producto, index) in productos" :key="index" class="row align-items-end mb-2 producto-item">
              <div class="col-md-5">
                <label class="form-label">Descripción:</label>
                <input v-model="producto.descripcion" type="text" class="form-control" />
              </div>
              <div class="col-md-2">
                <label class="form-label">Cantidad:</label>
                <input v-model.number="producto.cantidad" type="number" min="1" class="form-control" />
              </div>
              <div class="col-md-2">
                <label class="form-label">Precio U.:</label>
                <input v-model.number="producto.precio" type="number" step="0.01" class="form-control" />
              </div>
              <div class="col-md-2">
                <label class="form-label">Subtotal:</label>
                <input type="text" class="form-control" :value="subtotalProducto(producto)" disabled />
              </div>
              <div class="col-md-1 d-flex align-items-center">
                <button type="button" class="btn btn-danger btn-sm" @click="eliminarProducto(index)" title="Eliminar">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </div>
            <button type="button" class="btn btn-success mt-2" @click="agregarProducto">
              <i class="bi bi-plus-lg"></i> Agregar Producto
            </button>
          </div>

          <!-- TOTAL -->
          <div class="form-section text-end">
            <h3 class="h4">Total: {{ totalFactura.toFixed(2) }} {{ monedaSimbolo }}</h3>
            <button type="submit" class="btn btn-primary btn-lg">
              <i class="bi bi-file-earmark-pdf-fill me-2"></i>Generar Factura
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ref, computed } from "vue";
import logoUrl from '../assets/logo.png';

const cliente = ref({
  nombre: "",
  apellido: "",
  cedula: "",
  correo: "",
  direccion: "",
  telefono: "",
});

const camposCliente = {
  nombre: { label: "Nombre", type: "text" },
  apellido: { label: "Apellido", type: "text" },
  cedula: { label: "Cédula", type: "text" },
  correo: { label: "Correo", type: "email" },
  direccion: { label: "Dirección", type: "text" },
  telefono: { label: "Teléfono", type: "tel" },
};

const pago = ref({
  fechaPago: new Date().toISOString().split("T")[0],
  estado: "Pagado",
  metodoPago: "Divisas",
});

const productos = ref([{ descripcion: "", cantidad: 1, precio: 0 }]);

const agregarProducto = () => productos.value.push({ descripcion: "", cantidad: 1, precio: 0 });
const eliminarProducto = (index) => productos.value.splice(index, 1);

const subtotalProducto = (p) => (p.cantidad * p.precio).toFixed(2) + " " + monedaSimbolo.value;

const totalFactura = computed(() => productos.value.reduce((acc, p) => acc + p.cantidad * p.precio, 0));
const monedaSimbolo = computed(() => (pago.value.metodoPago === 'Divisas' ? '$' : 'Bs'));

const toBase64 = url => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  }));


const guardarFactura = async () => {
  try {
    // Primero buscar o crear cliente
    let clienteExistente = null;
    try {
      const clientesResponse = await fetch('http://localhost:3000/api/clientes');
      const clientes = await clientesResponse.json();
      clienteExistente = clientes.find(c => c.cedula === cliente.value.cedula);
    } catch (error) {
      console.error('Error buscando cliente:', error);
    }

    let idCliente;
    if (!clienteExistente) {
      const clienteData = {
        cedula: cliente.value.cedula,
        nombre: cliente.value.nombre,
        apellido: cliente.value.apellido,
        correo: cliente.value.correo,
        direccion: cliente.value.direccion,
        telefono: cliente.value.telefono
      };

      const clienteResponse = await fetch('http://localhost:3000/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteData)
      });

      if (!clienteResponse.ok) throw new Error('Error creando cliente');
      const clienteResult = await clienteResponse.json();
      idCliente = clienteResult.id;
    } else {
      idCliente = clienteExistente.id_cliente;
    }

    // Crear factura
    const facturaData = {
      fecha_fact: pago.value.fechaPago,
      estado_pago: pago.value.estado,
      id_cliente: idCliente,
      metodo_pago: pago.value.metodoPago
    };

    const facturaResponse = await fetch('http://localhost:3000/api/facturas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facturaData)
    });

    if (!facturaResponse.ok) throw new Error('Error creando factura');
    const facturaResult = await facturaResponse.json();

    return facturaResult.id;
  } catch (error) {
    console.error('Error guardando factura:', error);
    throw error;
  }
};

const generarPDF = async () => {
  if (!cliente.value.nombre || !cliente.value.apellido) {
    alert("Debe completar al menos el nombre y apellido del cliente.");
    return;
  }

  if (productos.value.length === 0 || productos.value.some(p => !p.descripcion || !p.precio || p.precio <= 0)) {
    alert("Debe agregar al menos un producto válido con descripción y precio.");
    return;
  }

  try {
    // Guardar factura en la base de datos primero
    await guardarFactura();

    const doc = new jsPDF();

    try {
      const base64Logo = await toBase64(logoUrl);
      doc.addImage(base64Logo, 'PNG', 15, 15, 40, 16);
    } catch (error) {
      console.error("No se pudo cargar el logo. Se generará la factura sin él.", error);
    }

    doc.setFontSize(18);
    doc.text("Factura de Venta", 105, 25, { align: "center" });
    doc.line(15, 35, 195, 35);

    let finalY = 45;
    autoTable(doc, {
      startY: finalY,
      body: [
        [{ content: "DATOS DEL CLIENTE", colSpan: 2, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }],
        ["Nombre y Apellido:", `${cliente.value.nombre} ${cliente.value.apellido}`],
        ["Cédula:", cliente.value.cedula],
        ["Correo:", cliente.value.correo],
        ["Teléfono:", cliente.value.telefono],
        ["Dirección:", cliente.value.direccion],
      ],
      theme: "plain",
      margin: { left: 15 },
      styles: { cellPadding: 2, fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
      didDrawPage: (data) => (finalY = data.cursor.y),
    });

    autoTable(doc, {
      startY: finalY + 5,
      body: [
        [{ content: "DETALLES DEL PAGO", colSpan: 2, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }],
        ["Fecha de Pago:", pago.value.fechaPago],
        ["Estado:", pago.value.estado],
        ["Método de Pago:", pago.value.metodoPago],
      ],
      theme: "plain",
      margin: { left: 15 },
      styles: { cellPadding: 2, fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
      didDrawPage: (data) => (finalY = data.cursor.y),
    });

    const head = [["Descripción", "Cantidad", "Precio Unitario", "Subtotal"]];
    const body = productos.value.map((p) => [
      p.descripcion,
      String(p.cantidad),
      `${p.precio.toFixed(2)} ${monedaSimbolo.value}`,
      `${(p.precio * p.cantidad).toFixed(2)} ${monedaSimbolo.value}`,
    ]);
    autoTable(doc, {
      startY: finalY + 10,
      head,
      body,
      theme: "grid",
      margin: { left: 15, right: 15 },
      headStyles: { fillColor: [31, 81, 63], textColor: 255 },
      styles: { cellPadding: 2, fontSize: 10 },
      columnStyles: { 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 35, halign: 'right' }, 3: { cellWidth: 35, halign: 'right' } },
      didDrawPage: (data) => (finalY = data.cursor.y),
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ${totalFactura.value.toFixed(2)} ${monedaSimbolo.value}`, 195, finalY + 10, { align: "right" });

    const nombreArchivo = `Factura_${cliente.value.nombre.replace(/\s+/g, "_")}_${cliente.value.apellido}.pdf`;
    doc.save(nombreArchivo);
  } catch (error) {
    console.error("Error al generar PDF:", error);
    alert("Error al generar el PDF. Verifica la consola para más detalles.");
  }
};
</script>

<style scoped>
.form-section {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
}
.producto-item {
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background-color: #fff;
}
.producto-item:nth-child(odd) {
  background-color: #f8f9fa;
}
</style>
