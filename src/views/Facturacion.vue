<template>
  <Side/>
  <div class="main-content">
    <div class="container mt-4">
      <!-- Modal de Historial -->
      <div class="modal fade" id="historialModal" tabindex="-1" aria-labelledby="historialModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header bg-secondary text-white">
              <h5 class="modal-title" id="historialModalLabel">
                <i class="bi bi-clock-history me-2"></i>Historial de Facturas
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <HistorialFacturas ref="historialComponent" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow">
        <div class="card-header bg-primary text-white">
          <h1 class="mb-0 h3">
            <i class="bi bi-receipt-cutoff me-2"></i>Módulo de Facturación
          </h1>
        </div>

        <div class="card-body">
          <form @submit.prevent="guardarFactura" class="factura-form">
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
                    @blur="key === 'cedula' && buscarClientePorCedula()"
                    class="form-control"
                    :readonly="key !== 'cedula' && clienteEncontrado"
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
                    <option>Bs efectivo</option>
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
              <h3 class="h4 mb-3">Total: {{ totalFactura.toFixed(2) }} {{ monedaSimbolo }}</h3>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary btn-lg" data-bs-toggle="modal" data-bs-target="#historialModal" @click="abrirHistorial">
                  <i class="bi bi-clock-history me-2"></i>Ver Historial
                </button>
                <button type="submit" class="btn btn-primary btn-lg">
                  <i class="bi bi-save-fill me-2"></i>Guardar Factura
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from 'vue-router';
import HistorialFacturas from './HistorialFacturas.vue';
// Eliminado jsPDF en cliente: usaremos generación en backend

const router = useRouter();
const route = useRoute();
const historialComponent = ref(null);
const API_BASE = 'http://localhost:3000/api';
const facturas = ref([]);
const loadingFacturas = ref(false);

const cliente = ref({
  id_cliente: null, // Guardaremos el ID del cliente si lo encontramos
  nombre: "",
  apellido: "",
  cedula: "",
  correo: "",
  direccion: "",
  telefono: "",
});

const clienteEncontrado = ref(false);

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

const subtotalProducto = (p) => {
  const cantidad = Number(p.cantidad) || 0;
  const precio = Number(p.precio) || 0;
  const subtotal = cantidad * precio;
  return subtotal.toFixed(2) + " " + monedaSimbolo.value;
};

const totalFactura = computed(() => productos.value.reduce((acc, p) => acc + p.cantidad * p.precio, 0));
const monedaSimbolo = computed(() => (pago.value.metodoPago === 'Divisas' ? '$' : 'Bs'));

const getMoneda = (factura) => factura.metodoPago === 'Divisas' ? '$' : 'Bs';

const getEstadoClass = (estado) => {
  switch (estado) {
    case 'Pagado': return 'bg-success';
    case 'Pendiente': return 'bg-warning text-dark';
    case 'Anulada': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

const buscarClientePorCedula = async () => {
  if (!cliente.value.cedula) return;

  // Normalizar la cédula: quitar espacios en blanco y ceros iniciales
  const cedulaLimpia = String(cliente.value.cedula).trim().replace(/^0+/, '');
  cliente.value.cedula = cedulaLimpia;

  try {
    const response = await fetch(`${API_BASE}/clientes/cedula/${cedulaLimpia}`);
    const data = await response.json();

    // Si la respuesta es exitosa y contiene datos (cliente encontrado)
    if (data.success && data.data) { // El helper de respuestas ahora asegura que el cliente esté en 'data'
      const clienteExistente = data.data;
      cliente.value.id_cliente = clienteExistente.id_cliente;
      cliente.value.nombre = clienteExistente.nombre;
      cliente.value.apellido = clienteExistente.apellido;
      cliente.value.correo = clienteExistente.correo; // Corregido de 'email' a 'correo'
      cliente.value.direccion = clienteExistente.direccion;
      cliente.value.telefono = clienteExistente.telefono;
      clienteEncontrado.value = true;
      alert('Cliente encontrado. Los datos han sido autocompletados.');
    } else { // Cliente no encontrado
      clienteEncontrado.value = false;
      cliente.value.id_cliente = null;
      if (confirm(`El cliente con cédula ${cedulaLimpia} no está registrado. ¿Desea registrarlo ahora?`)) {
        router.push({
          path: '/clientes', // CORRECCIÓN: Redirigir a la vista de clientes
          query: { cedula: cedulaLimpia }
        });
      }
    }
  } catch (error) {
    console.error("Error buscando cliente:", error);
    alert("Hubo un error al conectar con el servidor para buscar el cliente.");
  }
};

const resetFormulario = () => {
  cliente.value = { id_cliente: null, nombre: "", apellido: "", cedula: "", correo: "", direccion: "", telefono: "" };
  pago.value = {
    fechaPago: new Date().toISOString().split("T")[0],
    estado: "Pagado",
    metodoPago: "Divisas",
  };
  productos.value = [{ descripcion: "", cantidad: 1, precio: 0 }];
  clienteEncontrado.value = false;
}

const limpiarFormulario = () => {
  resetFormulario();
  alert("Formulario limpiado. Puede empezar una nueva factura.");
}
const abrirHistorial = () => {
  if (historialComponent.value) {
    historialComponent.value.fetchFacturas();
  }
}

const generarPDF = async (facturaId) => {
  try {
    // Generar PDF desde backend y guardar ruta en BD
    const response = await fetch(`${API_BASE}/facturas/${facturaId}/pdf`, { method: 'POST' });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || `Error HTTP: ${response.status}`);
    }
    const url = data.url.startsWith('http') ? data.url : `http://localhost:3000${data.url}`;
    // Abrir el PDF generado en nueva pestaña
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error generando PDF en backend:', error);
    alert(`Error al generar el PDF en el servidor: ${error.message}`);
  }
};

const guardarFactura = async () => {
  if (!cliente.value.nombre || !cliente.value.apellido || !cliente.value.cedula) {
    alert("Los datos del cliente (nombre, apellido, cédula) son obligatorios.");
    return;
  }

  if (productos.value.length === 0 || productos.value.some(p => !p.descripcion || !p.precio || p.precio <= 0)) {
    alert("Debe agregar al menos un producto válido con descripción y precio mayor a cero.");
    return;
  }

  try {
    const payload = {
      cliente: { ...cliente.value },
      factura: {
        fechaPago: pago.value.fechaPago,
        total: totalFactura.value,
        estado: pago.value.estado,
        metodoPago: pago.value.metodoPago,
      },
      items: productos.value.map(p => ({ ...p })),
    };

    const response = await fetch(`${API_BASE}/facturas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Error en la respuesta de la API');
    }

    // CORRECCIÓN: El ID de la factura viene dentro de data.data
    const nuevaFacturaId = data.data.id; // El ID de la nueva factura está en la respuesta
    alert(`Factura #${nuevaFacturaId} guardada exitosamente en la base de datos.`);

    // Generar PDF automáticamente después de guardar
    await generarPDF(nuevaFacturaId);

    limpiarFormulario();

  } catch (error) {
    console.error("Error al guardar la factura:", error);
    alert(`Error al guardar la factura: ${error.message}`);
  }
};

const cargarFacturas = async () => {
  loadingFacturas.value = true;
  try {
    const response = await fetch(`${API_BASE}/facturas`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    if (data.success) {
      facturas.value = data.data.slice(0, 10); // Mostrar las últimas 10 facturas
    } else {
      throw new Error(data.message || 'La API devolvió un error');
    }
  } catch (error) {
    console.error("Error al cargar facturas:", error);
    alert("No se pudieron cargar las facturas. Revise la conexión con el servidor.");
  } finally {
    loadingFacturas.value = false;
  }
};

onMounted(() => {
  cargarFacturas();
  // Si se pasa una cédula desde la URL (después de registrar cliente), buscar automáticamente
  if (route.query.cedula) {
    cliente.value.cedula = route.query.cedula;
    buscarClientePorCedula();
  }
});

// Limpiar estado al desmontar el componente para evitar problemas de navegación
onBeforeUnmount(() => {
  // Limpiar refs para evitar estado persistente entre navegaciones
  resetFormulario();
  facturas.value = [];
  loadingFacturas.value = false;
});
</script>

<style scoped>
.main-content {
  padding: 20px;
  min-height: 100vh;
  margin-left: 280px;
  background-color: #f8f9fa;
}

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

@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
  }
}
</style>
