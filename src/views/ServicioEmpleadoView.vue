<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, onMounted, computed, reactive } from 'vue';
import { useAuthStore } from '../stores/auth'; 

const API_BASE = 'http://localhost:3000/api';
const authStore = useAuthStore(); 
const servicios = ref([]);
const miId = ref(authStore.user?.id || null);

// --- FILTROS DE VISTA ---
const filtroActual = ref('activos'); 

// Control de Modales
const modalVisible = ref(false);
const modalStep = ref(1);
const accionPendiente = reactive({
  idServicio: null,
  nuevoEstado: null,
  esReversion: false,
  titulo: '',
  mensaje: '',
  manoObraInput: 0
});

// --- COMPUTED ---
const misServicios = computed(() => {
  if (!miId.value) return [];
  
  return servicios.value.filter(s => {
    // 1. Solo mis servicios
    const esMio = s.id_empleado_fk === miId.value;
    if (!esMio) return false;

    // 2. Filtro: El mecánico ve el carro hasta que Administración lo entregue
    const estaEntregado = s.entrega === 'Entregado';
    const estado = s.id_estado; // 1: Pendiente, 2: Taller, 3: Listo

    switch (filtroActual.value) {
      case 'activos': return !estaEntregado; // Todo lo que está en el taller
      case 'pendientes': return estado === 1 && !estaEntregado;
      case 'taller': return estado === 2 && !estaEntregado;
      case 'listos': return estado === 3 && !estaEntregado;
      case 'historial': return estaEntregado; // Historial personal
      default: return !estaEntregado;
    }
  });
});

const serviciosDisponibles = computed(() => {
  // Servicios huérfanos (Estado 1, sin mecánico)
  return servicios.value.filter(s => !s.id_empleado_fk && s.id_estado === 1);
});

// Contadores (Badges)
const contadores = computed(() => {
  if (!miId.value) return { pendientes: 0, taller: 0, listos: 0 };
  const mis = servicios.value.filter(s => s.id_empleado_fk === miId.value && s.entrega !== 'Entregado');
  return {
    pendientes: mis.filter(s => s.id_estado === 1).length,
    taller: mis.filter(s => s.id_estado === 2).length,
    listos: mis.filter(s => s.id_estado === 3).length
  };
});

const cargarDatos = async () => {
  try {
    const resServ = await fetch(`${API_BASE}/servicios`);
    const dS = await resServ.json();
    if(dS.success) servicios.value = dS.data;
    
    if (!authStore.isAuthenticated) window.location.href = '/login';
    if (authStore.user?.id) miId.value = authStore.user.id;
  } catch (e) { console.error(e); }
};

// 1. INICIAR FLUJO DE CAMBIO DE ESTADO
const solicitarCambioEstado = (servicio, nuevoEstado) => {
  accionPendiente.idServicio = servicio.id_servicio;
  accionPendiente.nuevoEstado = nuevoEstado;
  accionPendiente.manoObraInput = 0;
  modalStep.value = 1;

  if (nuevoEstado === 2 && servicio.id_estado === 1) {
    accionPendiente.titulo = '¿Iniciar Reparación?';
    accionPendiente.mensaje = 'El vehículo pasará a estado "En Reparación".';
    accionPendiente.esReversion = false;
  } else if (nuevoEstado === 3 && servicio.id_estado === 2) {
    accionPendiente.titulo = '¿Finalizar Reparación?';
    accionPendiente.mensaje = 'Se marcará como reparado. Debes ingresar la mano de obra para que Administración pueda cobrar.';
    accionPendiente.esReversion = false;
  } else if (nuevoEstado === 2 && servicio.id_estado === 3) {
    // REVERSION: De Listo -> En Taller
    accionPendiente.titulo = '¿Volver a Reparación?';
    accionPendiente.mensaje = '⚠️ El vehículo volverá a estar "En Proceso". Se borrará el costo de mano de obra registrado previamente.';
    accionPendiente.esReversion = true;
  }
  modalVisible.value = true;
};

// 2. CONFIRMAR
const confirmarPaso1 = async () => {
  if (accionPendiente.nuevoEstado === 3) modalStep.value = 2; 
  else ejecutarCambio();
};

// 3. EJECUTAR
const ejecutarCambio = async () => {
  try {
    const token = authStore.token;
    const payload = {
      nuevo_estado: accionPendiente.nuevoEstado,
      mano_obra: accionPendiente.nuevoEstado === 3 ? accionPendiente.manoObraInput : null
    };
    const res = await fetch(`${API_BASE}/servicios/${accionPendiente.idServicio}/estado`, {
      method: 'PUT', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
      body: JSON.stringify(payload)
    });
    if(res.ok) { modalVisible.value = false; cargarDatos(); }
    else { const d = await res.json(); alert(d.message); }
  } catch(e) { alert("Error de conexión"); }
};

// TOMAR SERVICIO
const tomarServicio = async (idServicio) => {
  if(!confirm("¿Tomar este servicio?")) return;
  try {
    const token = authStore.token;
    await fetch(`${API_BASE}/servicios/${idServicio}/asignar`, {
      method: 'PUT', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
      body: JSON.stringify({ id_empleado: miId.value })
    });
    // Auto iniciar
    await fetch(`${API_BASE}/servicios/${idServicio}/estado`, {
      method: 'PUT', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
      body: JSON.stringify({ nuevo_estado: 2 })
    });
    cargarDatos();
  } catch(e) { alert("Error al tomar servicio"); }
};

onMounted(cargarDatos);
</script>

<template>
  <div class="dashboard-container">
    <Side />
    <div class="main-content">
      
      <div class="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="page-title">Panel de Trabajo (Mecánico)</h1>
          <p class="page-subtitle">Gestiona tus reparaciones</p>
        </div>
        <div class="bg-white p-2 rounded shadow-sm border d-flex align-items-center gap-2">
          <small class="fw-bold text-muted">Usuario:</small>
          <span class="fw-bold text-primary">
            {{ authStore.user?.nombre || authStore.user?.nombre_emp || 'Usuario' }}
          </span>
          <small class="badge bg-info ms-2">{{ authStore.user?.cargo }}</small>
        </div>
      </div>

      <div class="row g-4">
        
        <div class="col-lg-8">
          
          <div class="filter-bar d-flex gap-2 mb-3 overflow-auto pb-2">
            <button class="btn rounded-pill px-3 fw-bold btn-sm transition-btn"
              :class="filtroActual === 'activos' ? 'btn-dark' : 'btn-white'" @click="filtroActual = 'activos'">
              Todos <span class="badge bg-secondary ms-1">{{ contadores.pendientes + contadores.taller + contadores.listos }}</span>
            </button>
            <button class="btn rounded-pill px-3 fw-bold btn-sm transition-btn"
              :class="filtroActual === 'pendientes' ? 'btn-warning text-dark' : 'btn-white'" @click="filtroActual = 'pendientes'">
              Pendientes <span class="badge bg-dark bg-opacity-25 ms-1">{{ contadores.pendientes }}</span>
            </button>
            <button class="btn rounded-pill px-3 fw-bold btn-sm transition-btn"
              :class="filtroActual === 'taller' ? 'btn-primary' : 'btn-white'" @click="filtroActual = 'taller'">
              En Taller <span class="badge bg-dark bg-opacity-25 ms-1">{{ contadores.taller }}</span>
            </button>
            <button class="btn rounded-pill px-3 fw-bold btn-sm transition-btn"
              :class="filtroActual === 'listos' ? 'btn-success' : 'btn-white'" @click="filtroActual = 'listos'">
              Listos <span class="badge bg-dark bg-opacity-25 ms-1">{{ contadores.listos }}</span>
            </button>
            <button class="btn rounded-pill px-3 fw-bold btn-sm transition-btn ms-auto"
              :class="filtroActual === 'historial' ? 'btn-secondary' : 'btn-white'" @click="filtroActual = 'historial'">
              <i class="fas fa-history me-1"></i>Historial
            </button>
          </div>

          <div v-if="misServicios.length === 0" class="text-center py-5 bg-white rounded shadow-sm">
            <i class="fas fa-clipboard-check fa-3x text-muted mb-3 opacity-50"></i>
            <p class="text-muted">No hay servicios en esta categoría.</p>
          </div>

          <div v-for="s in misServicios" :key="s.id_servicio" class="card mb-3 shadow-sm border-0 border-start border-5"
               :class="{
                 'border-warning': s.id_estado === 1,
                 'border-primary': s.id_estado === 2,
                 'border-success': s.id_estado === 3 && s.entrega !== 'Entregado',
                 'border-secondary': s.entrega === 'Entregado'
               }">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h4 class="mb-0 fw-bold text-dark d-flex align-items-center">
                    {{ s.vehiculo.matricula }}
                    <span v-if="s.entrega === 'Entregado'" class="badge bg-secondary ms-2 text-uppercase" style="font-size: 0.6rem;">Entregado</span>
                  </h4>
                  <div class="text-muted small">{{ s.vehiculo.marca_detalle?.nombre_marca }} {{ s.vehiculo.modelo }}</div>
                  
                  <small class="text-muted d-block mt-1">
                    <i class="far fa-calendar-alt me-1"></i>
                    Ingreso: {{ s.fecha_entrada ? new Date(s.fecha_entrada).toLocaleDateString() : 'N/A' }}
                  </small>
                </div>
                
                <span v-if="s.id_estado === 1" class="badge bg-warning text-dark rounded-pill px-3">Pendiente</span>
                <span v-else-if="s.id_estado === 2" class="badge bg-primary rounded-pill px-3">En Reparación</span>
                <span v-else-if="s.id_estado === 3" class="badge bg-success rounded-pill px-3">Listo</span>
              </div>
              
              <div class="mt-3 bg-light p-2 rounded border border-light">
                <div class="d-flex align-items-center text-danger fw-bold">
                  <i class="fas fa-bug me-2"></i> {{ s.falla.nombre_falla }}
                </div>
              </div>

              <div v-if="s.entrega !== 'Entregado'" class="mt-3 d-flex gap-2">
                
                <button v-if="s.id_estado === 1" @click="solicitarCambioEstado(s, 2)" class="btn btn-primary btn-sm w-100 fw-bold shadow-sm">
                  <i class="fas fa-play me-2"></i>Iniciar
                </button>

                <button v-if="s.id_estado === 2" @click="solicitarCambioEstado(s, 3)" class="btn btn-success btn-sm w-100 fw-bold shadow-sm">
                  <i class="fas fa-check-circle me-2"></i>Finalizar Trabajo
                </button>

                <button v-if="s.id_estado === 3" @click="solicitarCambioEstado(s, 2)" class="btn btn-outline-warning btn-sm w-100 fw-bold">
                  <i class="fas fa-undo me-2"></i>Volver a Taller (Corregir)
                </button>
                
                <div v-if="s.id_estado === 3" class="w-100 text-center text-success border border-success rounded p-1 bg-success bg-opacity-10 ms-2">
                    <small><i class="fas fa-clock me-1"></i>Esperando entrega al cliente</small>
                </div>
              </div>
              
              <div v-else class="mt-3 text-end">
                <small class="text-secondary fw-bold"><i class="fas fa-check-double me-1"></i> Servicio Cerrado el {{ s.fecha_salida ? new Date(s.fecha_salida).toLocaleDateString() : 'N/A' }}</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="content-card bg-white p-3 shadow-sm h-100 border-0">
            <h6 class="fw-bold mb-3 text-secondary text-uppercase border-bottom pb-2 d-flex justify-content-between">
              <span><i class="fas fa-inbox me-2"></i>Cola de Espera</span>
              <span class="badge bg-secondary">{{ serviciosDisponibles.length }}</span>
            </h6>
            
            <div v-if="serviciosDisponibles.length === 0" class="text-center py-5 text-muted small">
              <p>No hay vehículos sin asignar.</p>
            </div>

            <div v-for="s in serviciosDisponibles" :key="s.id_servicio" class="p-3 border rounded mb-2 hover-bg-light position-relative card-hover">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold text-dark">{{ s.vehiculo.matricula }}</div>
                  <div class="small text-danger fw-bold">{{ s.falla.nombre_falla }}</div>
                </div>
                <button @click="tomarServicio(s.id_servicio)" class="btn btn-sm btn-outline-primary fw-bold">Tomar</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div v-if="modalVisible">
      <div class="modal-backdrop fade show"></div>
      <div class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header" :class="accionPendiente.esReversion ? 'bg-danger text-white' : 'bg-primary text-white'">
              <h5 class="modal-title fw-bold">{{ accionPendiente.titulo }}</h5>
              <button type="button" class="btn-close btn-close-white" @click="modalVisible = false"></button>
            </div>
            <div v-if="modalStep === 1" class="modal-body p-4 text-center">
              <p class="fs-5">{{ accionPendiente.mensaje }}</p>
            </div>
            <div v-if="modalStep === 2" class="modal-body p-4">
              <label class="form-label fw-bold text-success">💰 Mano de Obra ($)</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-success text-white border-success">$</span>
                <input v-model="accionPendiente.manoObraInput" type="number" class="form-control border-success text-success fw-bold" placeholder="0.00">
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button class="btn btn-secondary" @click="modalVisible = false">Cancelar</button>
              <button v-if="modalStep === 1" class="btn fw-bold text-white" :class="accionPendiente.esReversion ? 'btn-danger' : 'btn-primary'" @click="confirmarPaso1">
                {{ accionPendiente.nuevoEstado === 3 ? 'Sí, continuar' : 'Confirmar' }}
              </button>
              <button v-if="modalStep === 2" class="btn btn-success fw-bold text-white" @click="ejecutarCambio">
                <i class="fas fa-save me-2"></i>Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Estilos Base */
.dashboard-container { display: flex; min-height: 100vh; background-color: #f3f6f9; font-family: 'Poppins', sans-serif; }
.main-content { flex: 1; padding: 2rem; margin-left: 250px; }

/* Botones de Filtro */
.btn-white { background: white; border: 1px solid #e3e6f0; color: #6c757d; }
.btn-white:hover { background: #f8f9fa; }
.transition-btn { transition: all 0.3s; }

/* Tarjetas */
.card-hover:hover { transform: translateX(5px); transition: transform 0.2s; cursor: pointer; }
.card { transition: transform 0.2s; border-radius: 10px; }
.card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.08); }

/* Modal Z-Index Fix */
.modal-backdrop { opacity: 0.5; z-index: 2000; background-color: #000; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; }
.modal { z-index: 2050; position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow-x: hidden; overflow-y: auto; }
</style>