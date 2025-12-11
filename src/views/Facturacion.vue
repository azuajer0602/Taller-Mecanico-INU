<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, computed, onMounted, reactive } from "vue";

const API_BASE = 'http://localhost:3000/api';

// --- ESTADOS ---
const cliente = ref({
  id_cliente: null, nombre: "", apellido: "", cedula: "", correo: "", direccion: "", telefono: ""
});
const factura = reactive({
  fechaPago: new Date().toISOString().split("T")[0],
  estado: "Pagado",
  metodoPago: "Bolivares en efectivo",
});
const productos = ref([]); 
const idServicioVinculado = ref(null);

// Datos para Modales y Búsqueda
const serviciosListos = ref([]);
const repuestos = ref([]);
const busquedaRepuesto = ref("");
const sugerenciasClientes = ref([]);
const mostrarSugerencias = ref(false);
const mostrarModalServicios = ref(false);
const mostrarModalRepuestos = ref(false);
const clienteEncontrado = ref(false);
let debounceTimeout = null;

// --- COMPUTED ---
const totalFactura = computed(() => productos.value.reduce((acc, p) => acc + (p.cantidad * p.precio), 0));
const monedaSimbolo = computed(() => (factura.metodoPago === 'Divisas' ? '$' : 'Bs'));

const repuestosFiltrados = computed(() => {
  if (!busquedaRepuesto.value) return repuestos.value;
  return repuestos.value.filter(r => 
    r.nombre_repuesto.toLowerCase().includes(busquedaRepuesto.value.toLowerCase())
  );
});

// --- FUNCIONES API ---

// 1. Cargar Servicios Listos (Reparados NO entregados)
const cargarServiciosListos = async () => {
  try {
    const res = await fetch(`${API_BASE}/servicios`);
    const data = await res.json();
    if(data.success) {
      serviciosListos.value = data.data.filter(s => s.id_estado === 3 && s.entrega !== 'Entregado');
      mostrarModalServicios.value = true;
    }
  } catch(e) { console.error(e); }
};

// En src/views/FacturacionView.vue

const cargarRepuestos = async () => {
  try {
    // CAMBIO AQUÍ: Apuntamos a tu ruta personalizada '/repuestos/obtenerRep'
    const res = await fetch(`${API_BASE}/repuestos/obtenerRep`); 
    
    const data = await res.json();
    
    // Ajuste: Tu controlador devuelve { repuestos: [...] }, no { data: [...] }
    // Verificamos si existe data.repuestos O data.data por seguridad
    const lista = data.repuestos || data.data;

    if(lista) {
      repuestos.value = lista.filter(r => r.stock_inventario > 0);
      mostrarModalRepuestos.value = true;
    }
  } catch(e) { console.error(e); }
};
// 3. Buscar Cliente Predictivo (Typeahead)
const buscarClientePredictivo = () => {
  const termino = cliente.value.cedula;
  if (!termino || termino.length < 2) {
    sugerenciasClientes.value = [];
    mostrarSugerencias.value = false;
    return;
  }
  if (debounceTimeout) clearTimeout(debounceTimeout);
  
  debounceTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`${API_BASE}/clientes/buscar?q=${termino}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        sugerenciasClientes.value = data.data;
        mostrarSugerencias.value = true;
      } else {
        sugerenciasClientes.value = [];
        mostrarSugerencias.value = false;
      }
    } catch (e) { console.error(e); }
  }, 300);
};

const seleccionarClienteSugerido = (c) => {
  Object.assign(cliente.value, c);
  clienteEncontrado.value = true;
  mostrarSugerencias.value = false;
};

// --- ACCIONES UI ---

const seleccionarServicio = (servicio) => {
  // Cargar cliente del servicio
  if (servicio.vehiculo && servicio.vehiculo.cliente_detalle) {
    Object.assign(cliente.value, servicio.vehiculo.cliente_detalle);
    clienteEncontrado.value = true;
  }
  // Agregar Servicio como item (Mano de Obra)
  productos.value = [];
  productos.value.push({
    descripcion: `Servicio Mecánico - ${servicio.falla.nombre_falla} (${servicio.vehiculo.matricula})`,
    cantidad: 1,
    precio: servicio.mano_obra,
    id_repuesto: null
  });
  idServicioVinculado.value = servicio.id_servicio;
  mostrarModalServicios.value = false;
};

const agregarRepuesto = (repuesto) => {
  productos.value.push({
    descripcion: repuesto.nombre_repuesto,
    cantidad: 1,
    precio: repuesto.precio_unitario,
    id_repuesto: repuesto.id_repuesto, // ID clave para descontar stock
    stockMax: repuesto.stock_inventario
  });
  mostrarModalRepuestos.value = false;
};

const eliminarProducto = (index) => productos.value.splice(index, 1);

const procesarFactura = async () => {
  if (!cliente.value.cedula || productos.value.length === 0) {
    alert("Faltan datos.");
    return;
  }

  const payload = {
    cliente: cliente.value,
    factura: {
      fechaPago: factura.fechaPago,
      total: totalFactura.value,
      estado: factura.estado,
      metodoPago: factura.metodoPago
    },
    items: productos.value,
    id_servicio: idServicioVinculado.value, 
  };

  try {
    const res = await fetch(`${API_BASE}/facturas`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    if (data.success) {
      alert("Factura generada exitosamente 🧾");
      // Generar y abrir PDF
      await fetch(`${API_BASE}/facturas/${data.data.id}/pdf`, { method: 'POST' })
        .then(r => r.json())
        .then(d => window.open(`http://localhost:3000${d.url}`, '_blank'));
      
      window.location.reload(); 
    } else {
      alert(data.message);
    }
  } catch(e) { alert("Error al facturar: " + e.message); }
};

const cerrarSugerencias = () => setTimeout(() => { mostrarSugerencias.value = false; }, 200);
</script>

<template>
  <Side />
  <div class="main-content">
    <div class="container-fluid mt-4">
      
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary"><i class="bi bi-receipt me-2"></i>Nueva Factura</h2>
        <div class="d-flex gap-2">
          <button @click="cargarServiciosListos" class="btn btn-warning text-dark fw-bold shadow-sm">
            <i class="bi bi-tools me-2"></i>Facturar Servicio
          </button>
          <button @click="cargarRepuestos" class="btn btn-info text-white fw-bold shadow-sm">
            <i class="bi bi-box-seam me-2"></i>Vender Repuesto
          </button>
        </div>
      </div>

      <div class="card shadow border-0">
        <div class="card-body p-4">
          <form @submit.prevent="procesarFactura">
            
            <h5 class="text-secondary border-bottom pb-2 mb-3">1. Datos del Cliente</h5>
            <div class="row g-3 mb-4">
              <div class="col-md-3 position-relative">
                <label class="form-label">Cédula / RIF</label>
                <div class="input-group">
                  <input v-model="cliente.cedula" @input="buscarClientePredictivo" @blur="cerrarSugerencias" type="text" class="form-control" required autocomplete="off">
                  <span class="input-group-text"><i class="bi bi-search"></i></span>
                </div>
                <ul v-if="mostrarSugerencias" class="list-group position-absolute w-100 shadow sugerencias-lista">
                    <li v-for="c in sugerenciasClientes" :key="c.id_cliente" 
                        class="list-group-item list-group-item-action cursor-pointer"
                        @click="seleccionarClienteSugerido(c)">
                        <strong>{{ c.cedula }}</strong> - {{ c.nombre }} {{ c.apellido }}
                    </li>
                </ul>
              </div>
              <div class="col-md-3">
                <label class="form-label">Nombre</label>
                <input v-model="cliente.nombre" type="text" class="form-control" :readonly="clienteEncontrado" required>
              </div>
              <div class="col-md-3">
                <label class="form-label">Apellido</label>
                <input v-model="cliente.apellido" type="text" class="form-control" :readonly="clienteEncontrado" required>
              </div>
              <div class="col-md-3">
                <label class="form-label">Teléfono</label>
                <input v-model="cliente.telefono" type="text" class="form-control">
              </div>
            </div>

            <h5 class="text-secondary border-bottom pb-2 mb-3">2. Items y Pago</h5>
            <div class="row g-3 mb-4">
               <div class="col-md-4">
                <label class="form-label">Método Pago</label>
                <select v-model="factura.metodoPago" class="form-select">
                  <option>Bolivares en efectivo</option><option>Pago Móvil</option><option>Punto de Venta</option><option>Transferencia</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Estado</label>
                <select v-model="factura.estado" class="form-select fw-bold" :class="factura.estado==='Pagado'?'text-success':'text-warning'">
                  <option value="Pagado">Pagado (Ingreso)</option><option value="Pendiente">Pendiente (Crédito)</option>
                </select>
              </div>
            </div>

            <div class="table-responsive mb-3">
              <table class="table table-bordered">
                <thead class="table-light">
                  <tr><th>Descripción</th><th width="100">Cant.</th><th width="150">Precio</th><th width="150">Total</th><th width="50"></th></tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in productos" :key="index">
                    <td>
                        <input v-model="item.descripcion" class="form-control form-control-sm" :readonly="item.id_repuesto">
                        <small v-if="item.id_repuesto" class="text-success">Repuesto (Stock Max: {{item.stockMax}})</small>
                    </td>
                    <td><input v-model.number="item.cantidad" type="number" min="1" :max="item.stockMax" class="form-control form-control-sm"></td>
                    <td><input v-model.number="item.precio" type="number" step="0.01" class="form-control form-control-sm"></td>
                    <td class="text-end fw-bold">{{ (item.cantidad * item.precio).toFixed(2) }} {{ monedaSimbolo }}</td>
                    <td><button @click="eliminarProducto(index)" type="button" class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button></td>
                  </tr>
                </tbody>
              </table>
              <button type="button" @click="productos.push({descripcion:'', cantidad:1, precio:0})" class="btn btn-sm btn-outline-secondary">
                <i class="bi bi-plus"></i> Manual
              </button>
            </div>

            <div class="text-end">
              <h3 class="text-primary fw-bold">Total: {{ totalFactura.toFixed(2) }} {{ monedaSimbolo }}</h3>
              <button type="submit" class="btn btn-success btn-lg mt-3 fw-bold shadow"><i class="bi bi-check-circle me-2"></i> Procesar</button>
            </div>

          </form>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalServicios" class="modal-backdrop-custom">
      <div class="modal-content-custom card shadow-lg p-3">
        <div class="d-flex justify-content-between mb-3">
            <h5>Seleccionar Servicio Listo</h5>
            <button @click="mostrarModalServicios = false" class="btn-close"></button>
        </div>
        <div class="list-group">
            <button v-for="s in serviciosListos" :key="s.id_servicio" @click="seleccionarServicio(s)" class="list-group-item list-group-item-action">
                <b>{{ s.vehiculo.matricula }}</b> - {{ s.falla.nombre_falla }} 
                <span class="float-end text-success fw-bold">{{ s.mano_obra }} $</span>
            </button>
            <div v-if="serviciosListos.length === 0" class="text-muted text-center p-3">No hay vehículos listos para entrega.</div>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalRepuestos" class="modal-backdrop-custom">
      <div class="modal-content-custom card shadow-lg p-3">
        <div class="d-flex justify-content-between mb-3">
            <h5>Agregar Repuesto</h5>
            <button @click="mostrarModalRepuestos = false" class="btn-close"></button>
        </div>
        <input v-model="busquedaRepuesto" class="form-control mb-3" placeholder="Buscar...">
        <div class="list-group" style="max-height: 300px; overflow-y: auto;">
            <button v-for="r in repuestosFiltrados" :key="r.id_repuesto" @click="agregarRepuesto(r)" class="list-group-item list-group-item-action">
                <b>{{ r.nombre_repuesto }}</b> (Stock: {{ r.stock_inventario }})
                <span class="float-end text-primary fw-bold">{{ r.precio_unitario }} $</span>
            </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.main-content { padding: 20px; min-height: 100vh; margin-left: 250px; background-color: #f8f9fa; }
.modal-backdrop-custom { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1050; display: flex; justify-content: center; align-items: center; }
.modal-content-custom { width: 90%; max-width: 600px; background: white; border-radius: 0.5rem; }
.sugerencias-lista { z-index: 1000; max-height: 200px; overflow-y: auto; }
.cursor-pointer { cursor: pointer; }
@media (max-width: 768px) { .main-content { margin-left: 0; } }
</style>