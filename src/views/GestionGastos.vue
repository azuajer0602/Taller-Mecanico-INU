<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import api from '../backend/services/api.js';

// --- ESTADO ---
const transacciones = ref([]);
const tiposDeOperacion = ref([]); 
const filtroBusqueda = ref('');
let modalInstancia = null;

// Función auxiliar para obtener fecha local en formato YYYY-MM-DD
const obtenerFechaLocal = () => {
  const fecha = new Date();
  const offset = fecha.getTimezoneOffset() * 60000; // Obtener diferencia horaria en milisegundos
  return new Date(fecha - offset).toISOString().split('T')[0];
};

//modelo del formulario
const nuevaOperacion = ref({
  descripcion: '',
  monto: '',
  fecha: obtenerFechaLocal(), // <--- CORREGIDO AQUÍ
  fechaVencimiento: '', 
  id_tipo_transaccion: '', 
  metodoPago: 'Bolívares'
});
const metodosPago = ['Bolívares', 'Divisas', 'Punto de Venta', 'Pago Móvil', 'Transferencia', 'Crédito'];

// --- COMPUTED: DETECCIÓN AUTOMÁTICA DE TIPO DE CUENTA ---

// Obtenemos el objeto completo de la categoría seleccionada
const tipoSeleccionado = computed(() => {
  return tiposDeOperacion.value.find(t => 
    t.id_tipo_transaccion === nuevaOperacion.value.id_tipo_transaccion || 
    t.id_tipo_transaccion_pk === nuevaOperacion.value.id_tipo_transaccion
  );
});

// Detectamos si es cuenta por pagar (Busca palabras clave o tipo Pasivo)
const esCuentaPorPagar = computed(() => {
  if (!tipoSeleccionado.value) return false;
  const nombre = tipoSeleccionado.value.nombre_tipo.toLowerCase();
  const tipo = tipoSeleccionado.value.tipo_cuenta.toUpperCase();
  // Lógica: Si el nombre dice "pagar" o "proveedor", o es un PASIVO que no sea Capital
  return nombre.includes('pagar') || nombre.includes('proveedor') || (tipo === 'PASIVO' && !nombre.includes('capital'));
});

// Detectamos si es cuenta por cobrar
const esCuentaPorCobrar = computed(() => {
  if (!tipoSeleccionado.value) return false;
  const nombre = tipoSeleccionado.value.nombre_tipo.toLowerCase();
  // Lógica: Si dice "cobrar", "cliente" o "crédito"
  return nombre.includes('cobrar') || nombre.includes('cliente') || nombre.includes('credito');
});

// --- API ---

const cargarTiposOperacion = async () => {
  try {
    const response = await api.get('/tipos-transaccion');
    if (response.data.success) {
      tiposDeOperacion.value = response.data.data;
    }
  } catch (error) {
    console.error('Error cargando tipos:', error);
  }
};

const cargarTransacciones = async () => {
  try {
    const response = await api.get('/transacciones');
    if (response.data.success) transacciones.value = response.data.data;
  } catch (error) {}
};

// --- GUARDAR CON LÓGICA DE VENCIMIENTO ---
const guardarOperacion = async () => {
  if (!nuevaOperacion.value.descripcion || !nuevaOperacion.value.monto || !nuevaOperacion.value.id_tipo_transaccion) {
    alert('Complete los campos obligatorios');
    return;
  }

  // Validación de fecha de vencimiento si aplica
  if ((esCuentaPorPagar.value || esCuentaPorCobrar.value) && !nuevaOperacion.value.fechaVencimiento) {
    alert('Al ser una cuenta por pagar/cobrar, debe indicar la Fecha de Vencimiento.');
    return;
  }

  try {
    const tipo = tipoSeleccionado.value;
    const esIngreso = ['INGRESO', 'CAPITAL', 'VENTA'].includes(tipo.tipo_cuenta);
    const monto = parseFloat(nuevaOperacion.value.monto);
    
    // Variables para las banderas
    const porPagar = esCuentaPorPagar.value ? 1 : 0;
    const porCobrar = esCuentaPorCobrar.value ? 1 : 0;
    const fVencimiento = (porPagar || porCobrar) ? nuevaOperacion.value.fechaVencimiento : null;

    const detallesPayload = [];

    /* LÓGICA DE ASIGNACIÓN DE BANDERAS:
       Las banderas 'es_cuenta_por_...' se asignan a la línea que lleva la Categoría seleccionada
       (La deuda o el crédito), no a la línea de Caja/Banco.
    */

    if (esIngreso) {
        // HABER: Aquí va la categoría (Ej: Ventas, Cuentas por Cobrar)
        detallesPayload.push({
            debe: monto, haber: 0,
            descripcion_detalle: `${nuevaOperacion.value.descripcion} (${nuevaOperacion.value.metodoPago})`,
            es_cuenta_por_cobrar: 0, 
            es_cuenta_por_pagar: 0
        });
        detallesPayload.push({
            debe: 0, haber: monto,
            descripcion_detalle: tipo.nombre_tipo,
            // AQUI APLICAMOS LA LÓGICA A LA CATEGORIA
            es_cuenta_por_cobrar: porCobrar, 
            es_cuenta_por_pagar: porPagar, 
            fecha_vencimiento: fVencimiento,
            Tipo_de_pago: nuevaOperacion.value.metodoPago
        });
    } else {
        // DEBE: Aquí va la categoría (Ej: Gasto, Cuentas por Pagar)
        detallesPayload.push({
            debe: monto, haber: 0,
            descripcion_detalle: tipo.nombre_tipo,
            // AQUI APLICAMOS LA LÓGICA A LA CATEGORIA
            es_cuenta_por_cobrar: porCobrar, 
            es_cuenta_por_pagar: porPagar,
            fecha_vencimiento: fVencimiento,
            Tipo_de_pago: nuevaOperacion.value.metodoPago
        });
        detallesPayload.push({
            debe: 0, haber: monto,
            descripcion_detalle: `${nuevaOperacion.value.descripcion} (${nuevaOperacion.value.metodoPago})`,
            es_cuenta_por_cobrar: 0, 
            es_cuenta_por_pagar: 0
        });
    }

    const payload = {
      id_tipo_transaccion_fk: nuevaOperacion.value.id_tipo_transaccion, 
      fecha_asiento: nuevaOperacion.value.fecha,
      detalles: detallesPayload 
    };

    await api.post('/transacciones', payload);
    await cargarTransacciones();
    cerrarModal();

  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar.');
  }
};

const eliminarOperacion = async (id) => {
  if (confirm('¿Eliminar?')) {
    try {
        await api.delete(`/transacciones/${id}`);
        await cargarTransacciones();
    } catch (error) { alert('Error al eliminar'); }
  }
};

// --- UI / HELPERS ---
const formatoMoneda = (valor) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(valor);

const obtenerColorBadge = (tipoCuenta) => {
  if (!tipoCuenta) return 'bg-secondary';
  const tipo = tipoCuenta.toUpperCase();
  if (['INGRESO', 'VENTA'].includes(tipo)) return 'bg-success';
  if (['GASTO', 'EGRESO'].includes(tipo)) return 'bg-danger';
  if (tipo === 'ACTIVO') return 'bg-primary';
  if (['CAPITAL', 'PATRIMONIO'].includes(tipo)) return 'bg-info text-dark';
  return 'bg-secondary';
};

const calcularMontoTotal = (detalles) => {
  if (!detalles || detalles.length === 0) return 0;
  return detalles.reduce((sum, d) => sum + parseFloat(d.debe || 0), 0);
};

const operacionesFiltradas = computed(() => {
  if (!filtroBusqueda.value) return transacciones.value;
  const texto = filtroBusqueda.value.toLowerCase();
  return transacciones.value.filter(t => {
    const desc = t.detalles?.[0]?.descripcion_detalle || '';
    const tipo = t.tipo_transaccion?.nombre_tipo || '';
    return desc.toLowerCase().includes(texto) || tipo.toLowerCase().includes(texto);
  });
});

const abrirModal = () => {
  nuevaOperacion.value = {
    descripcion: '', monto: '', fecha: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    id_tipo_transaccion: '', metodoPago: 'Bolívares'
  };
  modalInstancia.show();
};
const cerrarModal = () => modalInstancia.hide();

onMounted(async () => {
  modalInstancia = new Modal(document.getElementById('modalOperacion'));
  await cargarTiposOperacion(); 
  await cargarTransacciones(); 
});
</script>

<template>
  <Side />
  <div class="main-content">
    
    <div class="header-section mb-4 p-4 rounded-3 shadow-sm d-flex justify-content-between align-items-center">
      <div class="text-white">
        <h2 class="fw-bold mb-1"><i class="fas fa-cash-register me-2"></i>Registro de Operaciones</h2>
        <p class="mb-0 opacity-75">Gestión de Transacciones Contables</p>
      </div>
      <div>
        <button @click="cargarTransacciones" class="btn btn-outline-light me-2"><i class="fas fa-sync-alt"></i></button>
        <button @click="abrirModal" class="btn btn-light text-primary fw-bold shadow"><i class="fas fa-plus-circle me-2"></i>Nueva Transacción</button>
      </div>
    </div>

    <div class="card border-0 shadow">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h6 class="fw-bold mb-0 text-secondary"><i class="fas fa-list me-2"></i>Libro de Movimientos</h6>
        <div class="input-group w-auto">
            <span class="input-group-text bg-light"><i class="fas fa-search"></i></span>
            <input v-model="filtroBusqueda" type="text" class="form-control bg-light" placeholder="Buscar...">
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">Fecha</th>
                <th>Descripción</th>
                <th>Clasificación</th>
                <th class="text-end pe-4">Monto Total</th>
                <th class="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="operacionesFiltradas.length === 0"><td colspan="5" class="text-center py-5 text-muted">No hay datos</td></tr>
              <tr v-for="t in operacionesFiltradas" :key="t.id_transaccion">
                <td class="ps-4 text-secondary">{{ new Date(t.fecha_asiento).toLocaleDateString() }}</td>
                <td>
                    <span class="fw-bold d-block">{{ t.detalles?.[0]?.descripcion_detalle }}</span>
                    <small class="text-muted">Ref: TRX-{{ t.id_transaccion }}</small>
                </td>
                <td>
                    <span class="badge border" :class="obtenerColorBadge(t.tipo_transaccion?.tipo_cuenta)">
                        {{ t.tipo_transaccion?.nombre_tipo || 'General' }}
                    </span>
                    <span v-if="t.detalles?.some(d => d.es_cuenta_por_pagar)" class="badge bg-warning text-dark ms-1">CxP</span>
                    <span v-if="t.detalles?.some(d => d.es_cuenta_por_cobrar)" class="badge bg-info text-dark ms-1">CxC</span>
                </td>
                <td class="text-end pe-4 fw-bold">
                    {{ formatoMoneda(calcularMontoTotal(t.detalles)) }}
                </td>
                <td class="text-center">
                    <button @click="eliminarOperacion(t.id_transaccion)" class="btn btn-sm text-danger"><i class="fas fa-trash-alt"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modalOperacion" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-bold">Registrar Operación</h5>
          <button type="button" class="btn-close btn-close-white" @click="cerrarModal"></button>
        </div>
        <div class="modal-body p-4">
          <form @submit.prevent="guardarOperacion">
            
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted">Categoría Contable</label>
              <select v-model="nuevaOperacion.id_tipo_transaccion" class="form-select border-primary" required>
                <option value="" disabled>Seleccione una opción...</option>
                <option v-for="tipo in tiposDeOperacion" 
                        :key="tipo.id_tipo_transaccion || tipo.id_tipo_transaccion_pk" 
                        :value="tipo.id_tipo_transaccion || tipo.id_tipo_transaccion_pk">
                  {{ tipo.nombre_tipo }} ({{ tipo.tipo_cuenta }})
                </option>
              </select>
              <div class="form-text small text-danger" v-if="tiposDeOperacion.length === 0">
                 No se cargaron categorías. Revise conexión.
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold text-muted">Descripción</label>
              <input v-model="nuevaOperacion.descripcion" type="text" class="form-control" required>
            </div>
            
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label small fw-bold text-muted">Monto ($)</label>
                <input v-model="nuevaOperacion.monto" type="number" step="0.01" class="form-control fw-bold" required>
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold text-muted">Fecha Emisión</label>
                <input v-model="nuevaOperacion.fecha" type="date" class="form-control" required>
              </div>
            </div>

            <div v-if="esCuentaPorPagar || esCuentaPorCobrar" class="mb-3 bg-light p-3 rounded border border-warning">
                <label class="form-label small fw-bold text-dark">
                    <i class="fas fa-calendar-times me-1 text-warning"></i> 
                    Fecha de Vencimiento 
                    <span v-if="esCuentaPorPagar">(Pago a Proveedor)</span>
                    <span v-if="esCuentaPorCobrar">(Cobro a Cliente)</span>
                </label>
                <input v-model="nuevaOperacion.fechaVencimiento" type="date" class="form-control border-warning" required>
            </div>

            <div class="mb-4">
                <label class="form-label small fw-bold text-muted">Método de Pago</label>
                <select v-model="nuevaOperacion.metodoPago" class="form-select">
                    <option v-for="m in metodosPago" :key="m" :value="m">{{ m }}</option>
                </select>
            </div>

            <div class="d-grid">
              <button type="submit" class="btn btn-primary fw-bold">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  margin-left: 260px; 
  padding: 2rem;
  min-height: 100vh;
  background-color: #f8f9fa;
  margin-top: 0 !important;
  padding-top: 1rem;
}
.header-section {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
}
@media (max-width: 992px) {
  .main-content { margin-left: 0; padding: 1rem; }
}
</style>