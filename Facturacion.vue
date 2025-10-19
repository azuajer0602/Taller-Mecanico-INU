<template>
  <div class="facturacion-container">
    <h1>🧾 Módulo de Facturación</h1>

    <!-- Formulario de Factura -->
    <form @submit.prevent="generarPDF" class="factura-form">
      <div class="form-section">
        <h3>Datos del Cliente</h3>
        <label>Nombre:</label>
        <input v-model="cliente.nombre" type="text" required />
        <label>Correo:</label>
        <input v-model="cliente.correo" type="email" required />
      </div>

      <div class="form-section">
        <h3>Detalles del Producto</h3>
        <div v-for="(producto, index) in productos" :key="index" class="producto-item">
          <label>Descripción:</label>
          <input v-model="producto.descripcion" type="text" required />

          <label>Cantidad:</label>
          <input v-model.number="producto.cantidad" type="number" min="1" required />

          <label>Precio Unitario:</label>
          <input v-model.number="producto.precio" type="number" step="0.01" required />

          <button type="button" class="btn-eliminar" @click="eliminarProducto(index)">❌ Eliminar</button>
        </div>

        <button type="button" class="btn-agregar" @click="agregarProducto">➕ Agregar producto</button>
      </div>

      <div class="form-section resumen">
        <h3>Total: {{ totalFactura.toFixed(2) }} $</h3>
        <button type="submit" class="btn-generar">📄 Generar PDF</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import jsPDF from "jspdf";
import logo from "../assets/logo.png";

import { ref, computed } from "vue";

// Datos del cliente
const cliente = ref({
  nombre: "",
  correo: ""
});

// Lista de productos
const productos = ref([
  { descripcion: "", cantidad: 1, precio: 0 }
]);

// Agregar y eliminar productos
const agregarProducto = () => {
  productos.value.push({ descripcion: "", cantidad: 1, precio: 0 });
};

const eliminarProducto = (index) => {
  productos.value.splice(index, 1);
};

// Calcular total
const totalFactura = computed(() =>
  productos.value.reduce((acc, p) => acc + p.cantidad * p.precio, 0)
);

// Generar PDF
const generarPDF = () => {
  console.log("Iniciando generación de PDF...");
  if (!cliente.value.nombre) {
    alert("Por favor, ingrese el nombre del cliente.");
    return;
  }

  const img = new Image();
  img.src = logo;

  img.onload = () => {
    console.log("Logo cargado correctamente. Creando el documento.");
    const doc = new jsPDF();

    // Logo
    doc.addImage(img, "PNG", 85, 10, 40, 20);

    doc.setFontSize(14);
    doc.text("Factura de Venta", 85, 40);

    doc.setFontSize(11);
    doc.text(`Cliente: ${cliente.value.nombre}`, 20, 55);
    doc.text(`Correo: ${cliente.value.correo}`, 20, 62);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 69);

    doc.line(20, 75, 190, 75);

    let y = 85;
    doc.text("Descripción", 20, y);
    doc.text("Cant.", 110, y);
    doc.text("Precio", 140, y);
    doc.text("Subtotal", 170, y);
    y += 10;

    productos.value.forEach((p) => {
      doc.text(p.descripcion, 20, y);
      doc.text(String(p.cantidad), 115, y);
      doc.text(`${p.precio.toFixed(2)} $`, 140, y);
      doc.text(`${(p.precio * p.cantidad).toFixed(2)} $`, 170, y);
      y += 8;
    });

    doc.line(20, y, 190, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Total: ${totalFactura.value.toFixed(2)} $`, 150, y);

    const nombreArchivo = `Factura_${cliente.value.nombre.replace(/\s+/g, '_')}.pdf`;
    // Guardar PDF
    doc.save(nombreArchivo);
  };

  img.onerror = (err) => {
    console.error("Error: No se pudo cargar el logo para el PDF. El PDF no será generado.", err);
    // Opcional: generar el PDF sin el logo o mostrar un error al usuario
  };
};
</script>

<style scoped>
.facturacion-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 25px;
  background: #f6fff6;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #1f513f;
  margin-bottom: 20px;
}

.form-section {
  background: #ffffff;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  border-left: 5px solid #4caf50;
}

input {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.btn-agregar,
.btn-eliminar,
.btn-generar {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 12px;
  margin-top: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-eliminar {
  background: #f44336;
  margin-left: 10px;
}

.btn-agregar:hover,
.btn-eliminar:hover,
.btn-generar:hover {
  opacity: 0.8;
}

.resumen {
  text-align: right;
  font-size: 18px;
  font-weight: bold;
}
</style>
