<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, onMounted, computed } from 'vue';

const API_BASE = 'http://localhost:3000/api';
const servicios = ref([]);
const mecanicos = ref([]);
const loading = ref(false);

// --- FILTROS Y BÚSQUEDA ---
const filtroEstado = ref('todos'); // 'todos', 1 (Espera), 2 (Taller), 3 (Listo)
const busqueda = ref('');

// --- COMPUTED: FILTRADO ---
const serviciosFiltrados = computed(() => {
  return servicios.value.filter(s => {
    // 1. Filtro por Estado
    const pasaEstado = filtroEstado.value === 'todos' 
      ? true 
      : s.id_estado === filtroEstado.value;

    // 2. Filtro por Búsqueda (Placa, Modelo, Mecánico)
    const termino = busqueda.value.toLowerCase();
    const pasaBusqueda = 
      s.vehiculo.matricula.toLowerCase().includes(termino) ||
      s.vehiculo.modelo.toLowerCase().includes(termino) ||
      (s.mecanico ? s.mecanico.nombre_emp.toLowerCase().includes(termino) : false);

    return pasaEstado && pasaBusqueda;
  });
});

// Métricas rápidas
const contadores = computed(() => {
  return {
    espera: servicios.value.filter(s => s.id_estado === 1).length,
    taller: servicios.value.filter(s => s.id_estado === 2).length,
    listo: servicios.value.filter(s => s.id_estado === 3).length
  };
});

const cargarDatos = async () => {
  loading.value = true;
  try {
    const [resServ, resMec] = await Promise.all([
      fetch(`${API_BASE}/servicios`),
      fetch(`${API_BASE}/servicios/mecanicos`)
    ]);
    
    const dataServ = await resServ.json();
    const dataMec = await resMec.json();

    if(dataServ.success) servicios.value = dataServ.data;
    if(dataMec.success) mecanicos.value = dataMec.data;

  } catch (e) { console.error(e); } 
  finally { loading.value = false; }
};

const asignarMecanico = async (servicioId, idMecanico) => {
  if(!idMecanico) return;
  try {
    const res = await fetch(`${API_BASE}/servicios/${servicioId}/asignar`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id_empleado: idMecanico })
    });
    if(res.ok) {
      // alert("Mecánico asignado ✅"); // Opcional: quitar alerta para hacerlo más fluido
      cargarDatos();
    }
  } catch (e) { alert("Error al asignar"); }
};

// Utilidades de color
const getBorderClass = (id) => {
  if(id === 1) return 'border-warning';
  if(id === 2) return 'border-primary';
  if(id === 3) return 'border-success';
  return 'border-secondary';
};

const getBadgeClass = (id) => {
  if(id === 1) return 'bg-warning text-dark';
  if(id === 2) return 'bg-primary';
  if(id === 3) return 'bg-success';
  return 'bg-secondary';
};

onMounted(cargarDatos);
</script>

<template>
  <div class="dashboard-container">
    <Side />
    <div class="main-content">
      
      <div class="dashboard-header animate-fade-in mb-4">
        <div class="header-content">
          <div>
            <h1 class="page-title">Administración de Servicios</h1>
            <p class="page-subtitle">Gestiona el flujo de trabajo del taller</p>
          </div>
          <div class="search-wrapper">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
              <input v-model="busqueda" type="text" class="form-control border-start-0" placeholder="Buscar placa, modelo...">
            </div>
          </div>
        </div>
      </div>

      <div class="filter-bar d-flex gap-2 mb-4 overflow-auto pb-2">
        <button 
          class="btn rounded-pill px-4 fw-bold transition-btn"
          :class="filtroEstado === 'todos' ? 'btn-dark' : 'btn-white'"
          @click="filtroEstado = 'todos'"
        >
          Todos <span class="badge bg-secondary ms-2">{{ servicios.length }}</span>
        </button>

        <button 
          class="btn rounded-pill px-4 fw-bold transition-btn"
          :class="filtroEstado === 1 ? 'btn-warning' : 'btn-white'"
          @click="filtroEstado = 1"
        >
          <i class="fas fa-clock me-2"></i>En Espera <span class="badge bg-dark bg-opacity-25 ms-1">{{ contadores.espera }}</span>
        </button>

        <button 
          class="btn rounded-pill px-4 fw-bold transition-btn"
          :class="filtroEstado === 2 ? 'btn-primary' : 'btn-white'"
          @click="filtroEstado = 2"
        >
          <i class="fas fa-tools me-2"></i>En Taller <span class="badge bg-dark bg-opacity-25 ms-1">{{ contadores.taller }}</span>
        </button>

        <button 
          class="btn rounded-pill px-4 fw-bold transition-btn"
          :class="filtroEstado === 3 ? 'btn-success' : 'btn-white'"
          @click="filtroEstado = 3"
        >
          <i class="fas fa-check-circle me-2"></i>Listos <span class="badge bg-dark bg-opacity-25 ms-1">{{ contadores.listo }}</span>
        </button>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="serviciosFiltrados.length === 0" class="text-center py-5 text-muted bg-white rounded shadow-sm">
        <i class="fas fa-inbox fa-3x mb-3 opacity-25"></i>
        <p class="fs-5">No se encontraron servicios con estos filtros.</p>
      </div>

      <div v-else class="row g-4">
        <div v-for="s in serviciosFiltrados" :key="s.id_servicio" class="col-md-6 col-lg-4 col-xl-3">
          
          <div class="service-card card h-100 border-0 shadow-sm animate-up">
            <div class="status-strip" :class="getBadgeClass(s.id_estado)"></div>
            
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge rounded-pill" :class="getBadgeClass(s.id_estado)">
                  {{ s.id_estado === 1 ? 'Esperando' : (s.id_estado === 2 ? 'En Proceso' : 'Finalizado') }}
                </span>
                <small class="text-muted fw-bold">{{ s.fecha_entrada }}</small>
              </div>

              <h4 class="card-title fw-bold text-dark mb-0">{{ s.vehiculo.matricula }}</h4>
              <p class="card-subtitle text-muted small mb-3">
                {{ s.vehiculo.marca_detalle?.nombre_marca }} {{ s.vehiculo.modelo }}
              </p>

              <div class="p-2 bg-light rounded mb-3">
                <small class="text-uppercase text-muted fw-bold" style="font-size: 0.65rem;">Falla Reportada</small>
                <div class="text-danger fw-bold small text-truncate">
                  <i class="fas fa-exclamation-triangle me-1"></i>{{ s.falla.nombre_falla }}
                </div>
              </div>

              <div class="mt-auto">
                <label class="form-label small fw-bold text-primary mb-1">
                  <i class="fas fa-user-cog me-1"></i>Mecánico Asignado
                </label>
                
                <select 
                  class="form-select form-select-sm border-primary bg-primary bg-opacity-10 fw-bold text-primary"
                  :value="s.id_empleado_fk || ''"
                  @change="asignarMecanico(s.id_servicio, $event.target.value)"
                  :disabled="s.id_estado === 3" 
                >
                  <option value="" disabled class="text-muted">-- Sin Asignar --</option>
                  <option v-for="m in mecanicos" :key="m.id_empleado" :value="m.id_empleado">
                    {{ m.nombre_emp }} {{ m.apellido_emp }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="card-footer bg-white border-top-0 pt-0 pb-3">
              <div class="d-flex align-items-center">
                <div class="avatar-small me-2 bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style="width:25px; height:25px; font-size: 0.7rem;">
                  <i class="fas fa-user"></i>
                </div>
                <small class="text-muted text-truncate">
                  {{ s.vehiculo.cliente_detalle?.nombre }} {{ s.vehiculo.cliente_detalle?.apellido }}
                </small>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Estilos Base Dashboard */
.dashboard-container { display: flex; min-height: 100vh; background-color: #f3f6f9; font-family: 'Poppins', sans-serif; }
.main-content { flex: 1; padding: 2rem; margin-left: 250px; }
.dashboard-header { background: white; padding: 1.5rem 2rem; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center; }

/* Botones de Filtro */
.btn-white { background: white; border: 1px solid #e3e6f0; color: #6c757d; }
.btn-white:hover { background: #f8f9fa; }
.transition-btn { transition: all 0.3s; }

/* Tarjetas de Servicio */
.service-card { position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.service-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; }

.status-strip {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 5px; /* Línea de color a la izquierda */
}

/* Animación de entrada */
.animate-up { animation: slideUp 0.4s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* Buscador Header */
.search-wrapper { min-width: 300px; }

/* Responsive */
@media (max-width: 992px) {
  .main-content { margin-left: 0; padding: 1rem; }
  .dashboard-header { flex-direction: column; gap: 1rem; align-items: stretch; }
  .search-wrapper { width: 100%; }
}
</style>