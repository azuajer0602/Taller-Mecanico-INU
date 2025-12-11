<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, onMounted, computed, reactive } from 'vue';
import { useAuthStore } from '../stores/auth'; // Importa el store de autenticación

const API_BASE = 'http://localhost:3000/api';
const authStore = useAuthStore(); // Usa el store
const servicios = ref([]);
const mecanicos = ref([]);

// El ID del usuario ya viene del store
const miId = ref(authStore.user?.id || null);

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

const misServicios = computed(() => {
  if (!miId.value) return [];
  // Solo mostrar servicios asignados al mecánico actual
  return servicios.value.filter(s => s.id_empleado_fk === miId.value);
});

const serviciosDisponibles = computed(() => {
  // Mostrar servicios en espera (estado 1) que no tienen mecánico asignado
  return servicios.value.filter(s => !s.id_empleado_fk && s.id_estado === 1);
});

const cargarDatos = async () => {
  try {
    const [resServ] = await Promise.all([
      fetch(`${API_BASE}/servicios`),
    ]);
    const dS = await resServ.json();
    if(dS.success) servicios.value = dS.data;
    
    // Verificar que el usuario esté autenticado
    if (!authStore.isAuthenticated) {
      console.error("Usuario no autenticado");
      // Redirigir al login si no está autenticado
      window.location.href = '/login';
      return;
    }
    
    // Asignar automáticamente el ID del usuario logeado
    if (authStore.user && authStore.user.id) {
      miId.value = authStore.user.id;
    }
    
  } catch (e) { 
    console.error(e); 
  }
};

// 1. INICIAR FLUJO DE CAMBIO DE ESTADO
const solicitarCambioEstado = (servicio, nuevoEstado) => {
  // Verificar que el usuario esté logeado
  if (!miId.value) {
    alert("Debes estar autenticado para realizar esta acción");
    return;
  }
  
  accionPendiente.idServicio = servicio.id_servicio;
  accionPendiente.nuevoEstado = nuevoEstado;
  accionPendiente.manoObraInput = 0;
  modalStep.value = 1;

  if (nuevoEstado === 2 && servicio.id_estado === 1) {
    accionPendiente.titulo = '¿Iniciar Reparación?';
    accionPendiente.mensaje = 'El vehículo pasará a estado "En Reparación".';
    accionPendiente.esReversion = false;
  } 
  else if (nuevoEstado === 3 && servicio.id_estado === 2) {
    accionPendiente.titulo = '¿Finalizar Reparación?';
    accionPendiente.mensaje = 'Se marcará como reparado. Luego deberás ingresar el costo de mano de obra.';
    accionPendiente.esReversion = false;
  }
  else if (nuevoEstado === 2 && servicio.id_estado === 3) {
    accionPendiente.titulo = '¿Revertir a Reparación?';
    accionPendiente.mensaje = '⚠️ ADVERTENCIA: Se borrará el costo de mano de obra registrado anteriormente. ¿Deseas continuar?';
    accionPendiente.esReversion = true;
  }

  modalVisible.value = true;
};

// 2. CONFIRMAR ACCIÓN
const confirmarPaso1 = async () => {
  if (accionPendiente.nuevoEstado === 3) {
    modalStep.value = 2; 
  } else {
    ejecutarCambio();
  }
};

// 3. EJECUTAR LLAMADA API
const ejecutarCambio = async () => {
  try {
    // Agregar token de autenticación a la solicitud
    const token = authStore.token;
    
    const payload = {
      nuevo_estado: accionPendiente.nuevoEstado,
      mano_obra: accionPendiente.nuevoEstado === 3 ? accionPendiente.manoObraInput : null
    };

    const res = await fetch(`${API_BASE}/servicios/${accionPendiente.idServicio}/estado`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if(res.ok) {
      modalVisible.value = false;
      cargarDatos();
    } else {
      alert("Error al actualizar");
    }
  } catch(e) { 
    alert("Error de conexión"); 
  }
};

// Tomar servicio
const tomarServicio = async (idServicio) => {
  if(!miId.value) { 
    alert("Debes estar autenticado para tomar un servicio"); 
    return; 
  }
  
  if(!confirm("¿Tomar este servicio?")) return;
  try {
    const token = authStore.token;
    
    // Asignar servicio al mecánico actual
    await fetch(`${API_BASE}/servicios/${idServicio}/asignar`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id_empleado: miId.value })
    });
    
    // Auto iniciar el servicio
    await fetch(`${API_BASE}/servicios/${idServicio}/estado`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nuevo_estado: 2 })
    });
    
    cargarDatos();
  } catch(e) { 
    alert("Error al tomar servicio"); 
  }
};

onMounted(() => {
  // Verificar autenticación antes de cargar datos
  if (!authStore.isAuthenticated || !authStore.isMecanico) {
    alert("Acceso denegado. Debes ser un mecánico autenticado.");
    window.location.href = '/login';
    return;
  }
  
  cargarDatos();
});
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
            {{ authStore.user?.apellido_emp || '' }}
          </span>
          <small class="badge bg-info ms-2">
            {{ authStore.user?.cargo || 'Mecánico' }}
          </small>
        </div>
      </div>

      <div v-if="!miId" class="alert alert-warning text-center">
        <i class="fas fa-exclamation-triangle me-2"></i> 
        No se pudo cargar tu información de usuario. Por favor, <a href="/login" class="alert-link">inicia sesión nuevamente</a>.
      </div>

      <div v-else class="row g-4">
        
        <div class="col-lg-7">
          <h5 class="fw-bold mb-3 text-primary">
            <i class="fas fa-wrench me-2"></i>Mis Reparaciones Activas
            <span class="badge bg-primary ms-2">{{ misServicios.length }}</span>
          </h5>
          <div v-if="misServicios.length === 0" class="text-center py-5">
            <i class="fas fa-tools fa-3x text-muted mb-3"></i>
            <p class="text-muted">No tienes trabajos asignados actualmente.</p>
          </div>

          <div v-for="s in misServicios" :key="s.id_servicio" class="card mb-3 shadow-sm border-0 border-start border-5 border-primary">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h4 class="mb-0 fw-bold">{{ s.vehiculo.matricula }}</h4>
                  <div class="text-muted small">{{ s.vehiculo.marca_detalle.nombre_marca }} {{ s.vehiculo.modelo }}</div>
                  <small class="text-muted">Fecha: {{ new Date(s.fecha_ingreso).toLocaleDateString() }}</small>
                </div>
                <span class="badge" :class="s.id_estado === 1 ? 'bg-warning text-dark' : 'bg-primary'">
                  {{ s.id_estado === 1 ? 'Pendiente' : 'En Reparación' }}
                </span>
              </div>
              
              <div class="mt-3 bg-light p-2 rounded">
                <small class="text-uppercase fw-bold text-muted" style="font-size: 0.7rem;">Falla Reportada</small>
                <div class="text-danger fw-bold"><i class="fas fa-bug me-1"></i>{{ s.falla.nombre_falla }}</div>
              </div>

              <div class="mt-3 d-flex gap-2">
                <button v-if="s.id_estado === 1" 
                        @click="solicitarCambioEstado(s, 2)" 
                        class="btn btn-primary w-100 fw-bold">
                  <i class="fas fa-play me-2"></i>Iniciar Reparación
                </button>

                <button v-if="s.id_estado === 2" 
                        @click="solicitarCambioEstado(s, 3)" 
                        class="btn btn-success w-100 fw-bold">
                  <i class="fas fa-check-double me-2"></i>Finalizar Trabajo
                </button>
                
                <button v-if="s.id_estado === 3" 
                        disabled
                        class="btn btn-secondary w-100">
                  <i class="fas fa-check me-2"></i>Completado
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="content-card bg-white p-3 shadow-sm h-100">
            <h6 class="fw-bold mb-3 text-muted text-uppercase">
              <i class="fas fa-inbox me-2"></i>Servicios Disponibles
              <span class="badge bg-secondary ms-2">{{ serviciosDisponibles.length }}</span>
            </h6>
            <div v-if="serviciosDisponibles.length === 0" class="text-center py-4 text-muted small">
              <i class="fas fa-check-circle fa-2x mb-3"></i>
              <p>No hay vehículos en espera.</p>
            </div>
            <div v-for="s in serviciosDisponibles" :key="s.id_servicio" class="p-3 border rounded mb-2 hover-bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold">{{ s.vehiculo.matricula }}</div>
                  <div class="small text-danger">{{ s.falla.nombre_falla }}</div>
                  <div class="small text-muted">
                    <i class="fas fa-calendar me-1"></i>
                    {{ new Date(s.fecha_ingreso).toLocaleDateString() }}
                  </div>
                </div>
                <button @click="tomarServicio(s.id_servicio)" 
                        class="btn btn-sm btn-outline-primary">
                  <i class="fas fa-hand-paper me-1"></i>Tomar
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Modal -->
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
                <input v-model="accionPendiente.manoObraInput" 
                       type="number" 
                       class="form-control" 
                       placeholder="0.00" 
                       min="0"
                       step="0.01">
              </div>
              <small class="text-muted">Ingrese el valor final del servicio técnico.</small>
            </div>

            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="modalVisible = false">Cancelar</button>
              
              <button v-if="modalStep === 1" 
                      type="button" 
                      class="btn fw-bold" 
                      :class="accionPendiente.esReversion ? 'btn-danger' : 'btn-primary'" 
                      @click="confirmarPaso1">
                {{ accionPendiente.nuevoEstado === 3 ? 'Sí, continuar' : 'Confirmar Cambio' }}
              </button>

              <button v-if="modalStep === 2" 
                      type="button" 
                      class="btn btn-success fw-bold" 
                      @click="ejecutarCambio">
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
.dashboard-container { 
  display: flex; 
  min-height: 100vh; 
  background-color: #f3f6f9; 
  font-family: 'Poppins', sans-serif; 
}
.main-content { 
  flex: 1; 
  padding: 2rem; 
  margin-left: 250px; 
}
.hover-bg-light:hover { 
  background-color: #f8f9fa; 
  cursor: pointer; 
  transition: background-color 0.2s;
}
.card { 
  transition: transform 0.2s; 
  border-radius: 10px;
}
.card:hover { 
  transform: translateY(-5px); 
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
.modal-backdrop { 
  opacity: 0.5; 
  z-index: 1040; 
}
.modal { 
  z-index: 1050; 
}
.content-card {
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}
</style>