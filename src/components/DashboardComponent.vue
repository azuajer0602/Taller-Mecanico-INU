<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth'; // Usamos el store para el nombre

const API_BASE = 'http://localhost:3000/api';
const authStore = useAuthStore();

const usuarioIniciales = computed(() => {
  if (!authStore.user) return 'A';
  
  const nombreCompleto = authStore.user.nombre_emp || authStore.user.nombre || '';
  
  if (!nombreCompleto) {
    return (authStore.user.usuario || 'A').charAt(0).toUpperCase();
  }
  
  const partes = nombreCompleto.split(' ');
  if (partes.length >= 2) {
    return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase();
  } else {
    return partes[0].charAt(0).toUpperCase();
  }
});

const nombreCompleto = computed(() => {
  if (!authStore.user) return 'Administrador';
  
  return authStore.user.nombre_emp || 
         authStore.user.nombre || 
         authStore.user.usuario || 
         'Administrador';
});

// Computed para el cargo
const usuarioCargo = computed(() => {
  if (!authStore.user || !authStore.user.cargo) return 'MecanoSoft';
  return authStore.user.cargo;
});

// --- ESTADO ---
const metrics = ref({
  vehiculosReparados: 0,
  vehiculosEsteMes: 0,
  mecanicos: 0,
  mecanicosActivos: 0,
  ingresosMes: 0,
  ingresosMesAnterior: 0,
  serviciosActivos: 0
});

const vehiculosRecientes = ref([]);
const serviciosRecientes = ref([]);

const currentDate = new Date().toLocaleDateString('es-ES', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// --- COMPUTED ---
// Calculamos el porcentaje de crecimiento de ingresos
const porcentajeCrecimiento = computed(() => {
  if (metrics.value.ingresosMesAnterior === 0) return 100; // Si antes era 0, creció 100%
  return ((metrics.value.ingresosMes - metrics.value.ingresosMesAnterior) / metrics.value.ingresosMesAnterior * 100).toFixed(1);
});

// --- CARGA DE DATOS ---
const cargarDashboard = async () => {
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    const response = await res.json();

    if (response.success) {
      // 1. Asignar Métricas
      metrics.value = response.data.metrics;

      // 2. Mapear Vehículos Recientes
      vehiculosRecientes.value = response.data.listas.vehiculos.map(s => ({
        id: s.id_servicio,
        marca: s.vehiculo.marca_detalle?.nombre_marca || 'N/A',
        modelo: s.vehiculo.modelo,
        placa: s.vehiculo.matricula,
        cliente: s.vehiculo.cliente_detalle ? `${s.vehiculo.cliente_detalle.nombre} ${s.vehiculo.cliente_detalle.apellido}` : 'Anónimo',
        estado: getEstadoTexto(s.id_estado),
        fechaEntrada: new Date(s.fecha_entrada).toLocaleDateString(),
        // Usamos mano de obra o un valor por defecto si es null
        costo: s.mano_obra || 0 
      }));

      // 3. Mapear Servicios Recientes
      serviciosRecientes.value = response.data.listas.servicios.map(s => ({
        id: s.id_servicio,
        falla: s.falla.nombre_falla, // Usamos la falla como "Tipo"
        vehiculo: `${s.vehiculo.marca_detalle?.nombre_marca} ${s.vehiculo.modelo}`,
        mecanico: s.mecanico ? `${s.mecanico.nombre_emp} ${s.mecanico.apellido_emp}` : 'Sin asignar',
        fecha: new Date(s.fecha_entrada).toLocaleDateString(),
        costo: s.mano_obra || 0,
        id_estado: s.id_estado
      }));
    }
  } catch (e) {
    console.error("Error cargando dashboard:", e);
  }
};

const getEstadoTexto = (id) => {
  if(id === 1) return 'Pendiente';
  if(id === 2) return 'En Reparación';
  if(id === 3) return 'Completado';
  return 'Desconocido';
};

const getBadgeColor = (idEstado) => {
    if(idEstado === 1) return 'bg-warning text-dark';
    if(idEstado === 2) return 'bg-primary';
    if(idEstado === 3) return 'bg-success';
    return 'bg-secondary';
};

onMounted(() => {
  cargarDashboard();
  
  // Inyectar estilos externos si no están en index.html
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
  document.head.appendChild(link);
});
</script>

<template>
  <Side/>
  
  <div class="main-content">
    
    <header class="dashboard-header">
      <div class="header-left">
        <h1>Taller Mecánico - Dashboard</h1>
        <p class="text-capitalize">Bienvenido de nuevo, hoy es {{ currentDate }}</p>
      </div>
      <div class="header-right">
        <div class="user-profile">
          <div class="avatar-circle">{{ usuarioIniciales }}</div>
          <div class="d-flex flex-column">
           <span class="fw-bold">{{ nombreCompleto }}</span>
<small class="text-muted">{{ usuarioCargo }}</small>
          </div>
        </div>
      </div>
    </header>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon" style="background-color: #28a745;">
            <i class="fas fa-car"></i>
          </div>
          <div class="metric-info">
            <h3>Vehículos Reparados</h3>
            <p class="metric-value">{{ metrics.vehiculosReparados }}</p>
            <p class="metric-change positive">+{{ metrics.vehiculosEsteMes }} este mes</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon" style="background-color: #007bff;">
            <i class="fas fa-users"></i>
          </div>
          <div class="metric-info">
            <h3>Mecánicos</h3>
            <p class="metric-value">{{ metrics.mecanicos }}</p>
            <p class="metric-change">{{ metrics.mecanicosActivos }} activos hoy</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon" style="background-color: #ffc107;">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="metric-info">
            <h3>Ingresos del Mes</h3>
            <p class="metric-value">${{ metrics.ingresosMes.toLocaleString('es-VE', {minimumFractionDigits: 2}) }}</p>
            <p class="metric-change" :class="porcentajeCrecimiento >= 0 ? 'positive' : 'negative'">
                {{ porcentajeCrecimiento }}% vs mes anterior
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon" style="background-color: #dc3545;">
            <i class="fas fa-tools"></i>
          </div>
          <div class="metric-info">
            <h3>Servicios Activos</h3>
            <p class="metric-value">{{ metrics.serviciosActivos }}</p>
            <p class="metric-change">En progreso</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      
      <div class="col-lg-6">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-header bg-primary text-white">
            <h5 class="card-title mb-0">
              <i class="fas fa-car me-2"></i>Ingresos Recientes
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div v-for="vehiculo in vehiculosRecientes" :key="vehiculo.id" class="list-group-item list-group-item-action border-bottom">
                <div class="d-flex w-100 justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1 fw-bold">{{ vehiculo.marca }} {{ vehiculo.modelo }}</h6>
                    <p class="mb-1 text-muted small">
                      <span class="fw-bold text-dark">{{ vehiculo.placa }}</span> | {{ vehiculo.cliente }}
                    </p>
                    <span class="badge rounded-pill" :class="{
                      'bg-warning text-dark': vehiculo.estado === 'En Reparación',
                      'bg-success': vehiculo.estado === 'Completado',
                      'bg-secondary': vehiculo.estado === 'Pendiente'
                    }">
                      {{ vehiculo.estado }}
                    </span>
                  </div>
                  <div class="text-end">
                    <small class="text-muted d-block mb-1">{{ vehiculo.fechaEntrada }}</small>
                    <strong class="text-primary" v-if="vehiculo.costo > 0">${{ vehiculo.costo.toLocaleString() }}</strong>
                    <small class="text-muted" v-else>--</small>
                  </div>
                </div>
              </div>
              <div v-if="vehiculosRecientes.length === 0" class="p-4 text-center text-muted">No hay datos recientes.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-header bg-success text-white">
            <h5 class="card-title mb-0">
              <i class="fas fa-tools me-2"></i>Actividad del Taller
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div v-for="servicio in serviciosRecientes" :key="servicio.id" class="list-group-item list-group-item-action border-bottom">
                <div class="d-flex w-100 justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1 fw-bold text-danger">{{ servicio.falla }}</h6>
                    <p class="mb-1 text-muted small">
                      <strong>Vehículo:</strong> {{ servicio.vehiculo }} <br>
                      <strong>Mecánico:</strong> {{ servicio.mecanico }}
                    </p>
                    <span class="badge" :class="getBadgeColor(servicio.id_estado)">
                        {{ getEstadoTexto(servicio.id_estado) }}
                    </span>
                  </div>
                  <div class="text-end">
                    <small class="text-muted">{{ servicio.fecha }}</small>
                  </div>
                </div>
              </div>
              <div v-if="serviciosRecientes.length === 0" class="p-4 text-center text-muted">No hay actividad reciente.</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
#logo-img { width: 150px; height: 130px; margin-left: 50px; margin-bottom: 20px; }
.main-content { padding: 20px; min-height: 100vh; margin-left: 280px; background-color: #f8f9fa; }

/* Header */
.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding: 20px 0; border-bottom: 1px solid #dee2e6; }
.header-left h1 { color: #2c3e50; margin-bottom: 5px; font-size: 24px; font-weight: 600; }
.header-left p { color: #6c757d; font-size: 14px; margin-bottom: 0; }

.user-profile { display: flex; align-items: center; gap: 12px; background: white; padding: 10px 20px; border-radius: 50px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #e9ecef; }
.avatar-circle { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: bold;}

/* Metric Cards */
.metric-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 15px; height: 100%; border: 1px solid #e9ecef; transition: transform 0.2s ease; }
.metric-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.metric-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; flex-shrink: 0; }
.metric-info h3 { color: #6c757d; font-size: 12px; margin-bottom: 8px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.metric-value { color: #2c3e50; font-size: 22px; font-weight: 700; margin-bottom: 5px; line-height: 1; }
.metric-change { font-size: 11px; font-weight: 500; margin-bottom: 0; }
.metric-change.positive { color: #28a745; }
.metric-change.negative { color: #dc3545; }

/* Cards General */
.card { border: none; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.card-header { border-radius: 12px 12px 0 0 !important; border: none; padding: 15px 20px; font-weight: 600; }

/* List Groups */
.list-group-item { border: none; padding: 15px 20px; transition: background-color 0.2s ease; }
.list-group-item:hover { background-color: #f8f9fa; }

/* Responsive */
@media screen and (max-width: 768px) {
  .main-content { margin-left: 0; padding: 15px; }
  .dashboard-header { flex-direction: column; gap: 15px; align-items: flex-start; }
  .user-profile { align-self: flex-start; }
  .metric-card { padding: 15px; }
}
</style>