<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, onMounted, computed, reactive } from 'vue';

const API_BASE = 'http://localhost:3000/api';
const servicios = ref([]);
const mecanicos = ref([]);
const miId = ref(null);

// Control de Modales
const modalVisible = ref(false);
const modalStep = ref(1); // 1: Confirmación, 2: Input Mano Obra
const accionPendiente = reactive({
  idServicio: null,
  nuevoEstado: null,
  esReversion: false, // True si pasamos de 3 a 2
  titulo: '',
  mensaje: '',
  manoObraInput: 0
});

const misServicios = computed(() => {
  if (!miId.value) return [];
  // Mostramos estado 1 (espera) y 2 (reparacion)
  return servicios.value.filter(s => s.id_empleado_fk === miId.value && s.id_estado !== 3);
});

const serviciosDisponibles = computed(() => {
  // Estado 1 y sin mecánico
  return servicios.value.filter(s => !s.id_empleado_fk && s.id_estado === 1);
});

const cargarDatos = async () => {
  try {
    const [resServ, resMec] = await Promise.all([
      fetch(`${API_BASE}/servicios`),
      fetch(`${API_BASE}/servicios/mecanicos`)
    ]);
    const dS = await resServ.json();
    const dM = await resMec.json();
    if(dS.success) servicios.value = dS.data;
    if(dM.success) mecanicos.value = dM.data;
  } catch (e) { console.error(e); }
};

// 1. INICIAR FLUJO DE CAMBIO DE ESTADO
const solicitarCambioEstado = (servicio, nuevoEstado) => {
  accionPendiente.idServicio = servicio.id_servicio;
  accionPendiente.nuevoEstado = nuevoEstado;
  accionPendiente.manoObraInput = 0;
  modalStep.value = 1; // Reseteamos al paso 1 (Confirmación)

  // LOGICA DE MENSAJES Y FLUJO
  if (nuevoEstado === 2 && servicio.id_estado === 1) {
    // Iniciar Reparación
    accionPendiente.titulo = '¿Iniciar Reparación?';
    accionPendiente.mensaje = 'El vehículo pasará a estado "En Reparación".';
    accionPendiente.esReversion = false;
  } 
  else if (nuevoEstado === 3 && servicio.id_estado === 2) {
    // Finalizar Trabajo
    accionPendiente.titulo = '¿Finalizar Reparación?';
    accionPendiente.mensaje = 'Se marcará como reparado. Luego deberás ingresar el costo de mano de obra.';
    accionPendiente.esReversion = false;
  }
  else if (nuevoEstado === 2 && servicio.id_estado === 3) {
    // REVERTIR (Hubo error)
    accionPendiente.titulo = '¿Revertir a Reparación?';
    accionPendiente.mensaje = '⚠️ ADVERTENCIA: Se borrará el costo de mano de obra registrado anteriormente. ¿Deseas continuar?';
    accionPendiente.esReversion = true;
  }

  modalVisible.value = true;
};

// 2. CONFIRMAR ACCIÓN
const confirmarPaso1 = async () => {
  // Si vamos a finalizar (Estado 3), vamos al paso 2 (Input Precio)
  if (accionPendiente.nuevoEstado === 3) {
    modalStep.value = 2; 
  } else {
    // Si es cualquier otro cambio, ejecutamos directamente
    ejecutarCambio();
  }
};

// 3. EJECUTAR LLAMADA API
const ejecutarCambio = async () => {
  try {
    const payload = {
      nuevo_estado: accionPendiente.nuevoEstado,
      mano_obra: accionPendiente.nuevoEstado === 3 ? accionPendiente.manoObraInput : null
    };

    const res = await fetch(`${API_BASE}/servicios/${accionPendiente.idServicio}/estado`, {
      method: 'PUT', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });

    if(res.ok) {
      modalVisible.value = false;
      cargarDatos();
    } else {
      alert("Error al actualizar");
    }
  } catch(e) { alert("Error de conexión"); }
};

// Tomar servicio (Sin modal complejo, solo confirmación simple de navegador)
const tomarServicio = async (idServicio) => {
  if(!miId.value) { alert("Selecciona quién eres primero"); return; }
  if(!confirm("¿Tomar este servicio?")) return;
  try {
    await fetch(`${API_BASE}/servicios/${idServicio}/asignar`, {
      method: 'PUT', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id_empleado: miId.value })
    });
    // Auto iniciar
    await fetch(`${API_BASE}/servicios/${idServicio}/estado`, {
      method: 'PUT', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nuevo_estado: 2 })
    });
    cargarDatos();
  } catch(e) { alert("Error"); }
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
          <small class="fw-bold text-muted">Soy:</small>
          <select v-model="miId" class="form-select form-select-sm">
            <option :value="null">-- Seleccionar Usuario --</option>
            <option v-for="m in mecanicos" :key="m.id_empleado" :value="m.id_empleado">
              {{ m.nombre_emp }} {{ m.apellido_emp }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="!miId" class="alert alert-info text-center">
        <i class="fas fa-user-lock me-2"></i> Selecciona tu usuario arriba para ver tus trabajos.
      </div>

      <div v-else class="row g-4">
        
        <div class="col-lg-7">
          <h5 class="fw-bold mb-3 text-primary"><i class="fas fa-wrench me-2"></i>Mis Reparaciones</h5>
          <div v-if="misServicios.length === 0" class="text-muted fst-italic py-3">
            No tienes trabajos asignados.
          </div>

          <div v-for="s in misServicios" :key="s.id_servicio" class="card mb-3 shadow-sm border-0 border-start border-5 border-primary">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h4 class="mb-0 fw-bold">{{ s.vehiculo.matricula }}</h4>
                  <div class="text-muted small">{{ s.vehiculo.marca_detalle.nombre_marca }} {{ s.vehiculo.modelo }}</div>
                </div>
                <span class="badge" :class="s.id_estado === 1 ? 'bg-warning text-dark' : 'bg-primary'">
                  {{ s.id_estado === 1 ? 'Esperando inicio' : 'En Reparación' }}
                </span>
              </div>
              
              <div class="mt-3 bg-light p-2 rounded">
                <small class="text-uppercase fw-bold text-muted" style="font-size: 0.7rem;">Falla Reportada</small>
                <div class="text-danger fw-bold"><i class="fas fa-bug me-1"></i>{{ s.falla.nombre_falla }}</div>
              </div>

              <div class="mt-3 d-flex gap-2">
                <button v-if="s.id_estado === 1" @click="solicitarCambioEstado(s, 2)" class="btn btn-primary w-100 fw-bold">
                  <i class="fas fa-play me-2"></i>Iniciar Reparación
                </button>

                <button v-if="s.id_estado === 2" @click="solicitarCambioEstado(s, 3)" class="btn btn-success w-100 fw-bold">
                  <i class="fas fa-check-double me-2"></i>Finalizar Trabajo
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="content-card bg-white p-3 shadow-sm h-100">
            <h6 class="fw-bold mb-3 text-muted text-uppercase"><i class="fas fa-inbox me-2"></i>Disponibles</h6>
            <div v-if="serviciosDisponibles.length === 0" class="text-center py-4 text-muted small">No hay vehículos en espera.</div>
            <div v-for="s in serviciosDisponibles" :key="s.id_servicio" class="p-3 border rounded mb-2 hover-bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold">{{ s.vehiculo.matricula }}</div>
                  <div class="small text-danger">{{ s.falla.nombre_falla }}</div>
                </div>
                <button @click="tomarServicio(s.id_servicio)" class="btn btn-sm btn-outline-primary">Tomar</button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div v-if="modalVisible" class="modal-backdrop fade show"></div>
      <div v-if="modalVisible" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            
            <div class="modal-header" :class="accionPendiente.esReversion ? 'bg-danger text-white' : 'bg-primary text-white'">
              <h5 class="modal-title fw-bold">
                <i class="fas" :class="accionPendiente.esReversion ? 'fa-exclamation-triangle' : 'fa-info-circle'"></i>
                {{ accionPendiente.titulo }}
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="modalVisible = false"></button>
            </div>

            <div v-if="modalStep === 1" class="modal-body p-4 text-center">
              <p class="fs-5">{{ accionPendiente.mensaje }}</p>
            </div>

            <div v-if="modalStep === 2" class="modal-body p-4">
              <label class="form-label fw-bold text-success">💰 Costo de Mano de Obra ($)</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text">$</span>
                <input v-model="accionPendiente.manoObraInput" type="number" class="form-control" placeholder="0.00" min="0">
              </div>
              <small class="text-muted">Ingrese el valor final del servicio técnico.</small>
            </div>

            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="modalVisible = false">Cancelar</button>
              
              <button v-if="modalStep === 1" type="button" class="btn fw-bold" :class="accionPendiente.esReversion ? 'btn-danger' : 'btn-primary'" @click="confirmarPaso1">
                {{ accionPendiente.nuevoEstado === 3 ? 'Sí, continuar' : 'Confirmar Cambio' }}
              </button>

              <button v-if="modalStep === 2" type="button" class="btn btn-success fw-bold" @click="ejecutarCambio">
                <i class="fas fa-save me-2"></i>Guardar y Finalizar
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* CSS base */
.dashboard-container { display: flex; min-height: 100vh; background-color: #f3f6f9; font-family: 'Poppins', sans-serif; }
.main-content { flex: 1; padding: 2rem; margin-left: 250px; }
.hover-bg-light:hover { background-color: #f8f9fa; }
.card { transition: transform 0.2s; }
.card:hover { transform: translateY(-3px); }
/* Modal Backdrop Fix */
.modal-backdrop { opacity: 0.5; z-index: 1040; }
.modal { z-index: 1050; }
</style>