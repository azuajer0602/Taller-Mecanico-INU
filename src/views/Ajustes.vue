<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const API_BASE_URL = 'http://localhost:3000/api/repuestos';
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
// --- ESTADOS ---
const repuesto = reactive({
  id_repuesto: "",
  nombre_repuesto: "",
  desc_repuesto: "",
  precio_unitario: "",
  stock_inventario: ""
});

const repuestos = ref([]);
const cargando = ref(false);
const error = ref(null);
const busqueda = ref('');
const repuestoEditandoId = ref(null);

// --- COMPUTED ---
const totalRepuestos = computed(() => repuestos.value.length);

const repuestosFiltrados = computed(() => {
  if (!busqueda.value) return repuestos.value;
  const lower = busqueda.value.toLowerCase();
  return repuestos.value.filter(r => 
    r.id_repuesto?.toString().toLowerCase().includes(lower) ||
    r.nombre_repuesto?.toLowerCase().includes(lower) ||
    r.desc_repuesto?.toLowerCase().includes(lower)
  );
});

// --- MÉTODOS ---
const cargarRepuestos = async () => {
  cargando.value = true;
  error.value = null;
  try {
    const response = await axios.get(`${API_BASE_URL}/obtenerRep`);
    repuestos.value = response.data.repuestos || response.data;
  } catch (err) {
    console.error('Error al cargar repuestos:', err);
    error.value = `Error: ${err.response?.status || 'Conexión'} - ${err.response?.data?.message || err.message}`;
  } finally {
    cargando.value = false;
  }
};

const submitForm = async () => {
  try {
    const datosParaEnviar = {
      id_repuesto: repuesto.id_repuesto,
      nombre_repuesto: repuesto.nombre_repuesto,
      desc_repuesto: repuesto.desc_repuesto,
      precio_unitario: parseFloat(repuesto.precio_unitario) || 0,
      stock_inventario: parseInt(repuesto.stock_inventario) || 0
    };

    if (repuestoEditandoId.value !== null) {
      await axios.put(`${API_BASE_URL}/updateRep`, datosParaEnviar);
    } else {
      await axios.post(`${API_BASE_URL}/registerRep`, datosParaEnviar);
    }
    
    await cargarRepuestos();
    cancelarEdicion();
    alert(repuestoEditandoId.value !== null ? 'Repuesto actualizado' : 'Repuesto registrado');
    
  } catch (err) {
    console.error('Error al guardar repuesto:', err);
    alert('Error: ' + (err.response?.data?.message || err.message));
  }
};

const editarRepuesto = (repuestoParaEditar) => {
  Object.assign(repuesto, {
    id_repuesto: repuestoParaEditar.id_repuesto,
    nombre_repuesto: repuestoParaEditar.nombre_repuesto,
    desc_repuesto: repuestoParaEditar.desc_repuesto,
    precio_unitario: repuestoParaEditar.precio_unitario,
    stock_inventario: repuestoParaEditar.stock_inventario
  });
  
  repuestoEditandoId.value = repuestoParaEditar.id_repuesto;
};

const eliminarRepuesto = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este Repuesto?')) {
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/deleteRep`, {
      data: { id_repuesto: id }
    });
    
    await cargarRepuestos();
    alert('Repuesto eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar Repuesto:', error);
    alert('Error: ' + (error.response?.data?.message || error.message));
  }
};

const cancelarEdicion = () => {
  Object.assign(repuesto, {
    id_repuesto: "",
    nombre_repuesto: "",
    desc_repuesto: "",
    precio_unitario: "",
    stock_inventario: ""
  });
  repuestoEditandoId.value = null;
};

onMounted(() => {
  cargarRepuestos();
});
</script>

<template>
  <div class="dashboard-container">
    <Side />
    
    <div class="main-content">
      
      <div class="dashboard-header animate-fade-in">
        <div class="header-content">
          <div>
            <h1 class="page-title">Gestión de Repuestos</h1>
            <p class="page-subtitle">Administra el inventario de repuestos del taller</p>
          </div>
          <div class="user-profile">
            <div class="avatar-circle">{{ usuarioIniciales }}</div>
            <div>
              <div class="user-name">{{nombreCompleto}}</div>
              <div class="user-role">{{usuarioCargo}}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de registro/edición -->
      <div class="content-card shadow-sm bg-white mb-4">
        <div class="p-4">
          <div class="text-center mb-4">
            <div class="client-avatar-large mx-auto mb-3 bg-info-soft">
              <i class="fas fa-cog text-info"></i>
            </div>
            <h3 class="fw-bold text-dark">{{ repuestoEditandoId !== null ? 'Editar Repuesto' : 'Registrar Nuevo Repuesto' }}</h3>
            <p class="text-muted">{{ repuestoEditandoId !== null ? 'Modifica los datos del repuesto seleccionado' : 'Ingresa los datos del nuevo repuesto para el inventario' }}</p>
          </div>
          
          <form @submit.prevent="submitForm">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label for="id_repuesto" class="form-label fw-bold text-dark">ID Repuesto</label>
                <input v-model="repuesto.id_repuesto" type="text" class="form-control" id="id_repuesto" 
                       placeholder="Ej: 03" required />
              </div>
              <div class="col-md-6">
                <label for="nombre_repuesto" class="form-label fw-bold text-dark">Nombre del Repuesto</label>
                <input v-model="repuesto.nombre_repuesto" type="text" class="form-control" id="nombre_repuesto" 
                       placeholder="Ej: Amortiguador" required />
              </div>
            </div>

            <div class="mb-3">
              <label for="desc_repuesto" class="form-label fw-bold text-dark">Descripción</label>
              <input v-model="repuesto.desc_repuesto" type="text" class="form-control" id="desc_repuesto" 
                     placeholder="Detalles y características del repuesto" required />
            </div>

          
            <div class="d-flex justify-content-end gap-2 pt-2">
              <button type="button" class="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold" 
                      @click="cancelarEdicion" v-if="repuestoEditandoId !== null">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm">
                {{ repuestoEditandoId !== null ? 'Actualizar Repuesto' : 'Registrar Repuesto' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="row mb-4 g-3">
        <div class="col-md-12">
          <div class="metric-card info-card h-100">
            <div>
              <div class="metric-value">{{ totalRepuestos }}</div>
              <div class="metric-label">Repuestos en Inventario</div>
            </div>
            <div class="metric-icon-container bg-info-soft">
              <i class="fas fa-boxes text-info"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de repuestos -->
      <div class="content-card shadow-sm bg-white">
        
        <div class="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="search-box position-relative" style="min-width: 250px;">
            <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 50%; transform: translateY(-50%);"></i>
            <input 
              v-model="busqueda" 
              type="text" 
              class="form-control ps-5" 
              placeholder="Buscar por ID, nombre o descripción..."
            >
          </div>
        </div>

        <div class="table-responsive">
          <table class="table custom-table mb-0">
            <thead>
              <tr>
                <th>ID Repuesto</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio Unitario</th>
                <th>Stock Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rep in repuestosFiltrados" :key="rep.id_repuesto" class="hover-row">
                <td data-label="ID">
                  <span class="badge bg-light text-dark border fw-bold px-3 py-2">
                    {{ rep.id_repuesto }}
                  </span>
                </td>
                <td data-label="Nombre">
                  <div class="d-flex align-items-center">
                    <div class="client-avatar-small me-2 bg-info-soft">
                      <i class="fas fa-cog text-info"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ rep.nombre_repuesto }}</div>
                    </div>
                  </div>
                </td>
                <td data-label="Descripción">
                  <div class="text-muted small">{{ rep.desc_repuesto || 'Sin descripción' }}</div>
                </td>
                <td data-label="Precio">
                  <div class="fw-bold text-dark">
                    {{ parseFloat(rep.precio_unitario || 0).toLocaleString('es-VE', { style: 'currency', currency: 'VES' }) }}
                  </div>
                </td>
                <td data-label="Stock">
                  <div :class="{
                    'badge': true,
                    'bg-success-soft text-success px-3 rounded-pill': rep.stock_inventario >= 10,
                    'bg-warning-soft text-warning px-3 rounded-pill': rep.stock_inventario < 10 && rep.stock_inventario > 0,
                    'bg-danger-soft text-danger px-3 rounded-pill': rep.stock_inventario <= 0
                  }">
                    {{ rep.stock_inventario }} unidades
                  </div>
                </td>
                <td data-label="Acciones">
                  <div class="d-flex gap-2">
                    <button class="btn-icon" @click="editarRepuesto(rep)" title="Editar">
                      <i class="fas fa-edit text-warning"></i>
                    </button>
                    <button class="btn-icon" @click="eliminarRepuesto(rep.id_repuesto)" title="Eliminar">
                      <i class="fas fa-trash text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Estado de carga -->
              <tr v-if="cargando">
                <td colspan="6" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                  <p class="mt-2 text-muted">Cargando repuestos...</p>
                </td>
              </tr>
              
              <!-- Error -->
              <tr v-else-if="error">
                <td colspan="6" class="text-center py-5 text-danger">
                  <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                  <p>{{ error }}</p>
                </td>
              </tr>
              
              <!-- Sin resultados -->
              <tr v-else-if="repuestosFiltrados.length === 0 && !cargando">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                  <p>No se encontraron repuestos</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ESTILOS BASE - Mismos que la vista de inventario */
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
  transition: all 0.3s ease;
}

/* Header */
.dashboard-header {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title { font-size: 1.5rem; font-weight: 700; color: #2c3e50; margin: 0; }
.page-subtitle { color: #95a5a6; font-size: 0.9rem; margin-top: 5px; }

/* Perfil */
.user-profile {
  display: flex; align-items: center; gap: 15px;
  padding: 8px 15px; background: #f8f9fa; border-radius: 50px;
}
.avatar-circle {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}
.user-name { font-weight: 600; font-size: 0.9rem; color: #2c3e50; }
.user-role { font-size: 0.75rem; color: #95a5a6; }

/* Tarjetas Métricas */
.metric-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  height: 100%;
  border-left: 5px solid transparent;
}

.info-card { border-left-color: #36b9cc; }

.metric-value { font-size: 2rem; font-weight: 700; color: #2c3e50; line-height: 1.2; }
.metric-label { color: #858796; font-size: 0.9rem; margin-top: 5px; font-weight: 500; }

.metric-icon-container {
  width: 60px; height: 60px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
}
.bg-info-soft { background-color: rgba(54, 185, 204, 0.1); }
.bg-success-soft { background-color: rgba(28, 200, 138, 0.1); }
.bg-warning-soft { background-color: rgba(246, 194, 62, 0.1); }
.bg-danger-soft { background-color: rgba(231, 74, 59, 0.1); }

/* Tarjetas de contenido */
.content-card { border-radius: 16px; overflow: hidden; }

/* Iconos grandes para formulario */
.client-avatar-large {
  width: 80px; height: 80px;
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.5rem;
}

/* Tabla */
.custom-table th {
  font-weight: 600; text-transform: uppercase; font-size: 0.75rem;
  color: #858796; padding: 1rem; background-color: #f8f9fc; border-bottom: 2px solid #e3e6f0;
}
.custom-table td { padding: 1rem; border-bottom: 1px solid #f0f2f5; vertical-align: middle; }
.hover-row:hover { background-color: #f8f9fc; }

.client-avatar-small {
  width: 35px; height: 35px; background-color: #e2e6ea;
  color: #6c757d; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9rem;
}

.btn-icon {
  width: 32px; height: 32px; padding: 0;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: all 0.2s; border: none; background: transparent;
}
.btn-icon:hover { transform: scale(1.1); background-color: #f1f3f9; }

/* Formulario */
.form-control {
  border: 1px solid #e3e6f0;
  border-radius: 10px;
  padding: 10px 15px;
  transition: all 0.3s ease;
}
.form-control:focus {
  border-color: #4e73df;
  box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
  border: none;
  transition: all 0.3s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(78, 115, 223, 0.3);
}

.btn-outline-secondary {
  border: 2px solid #e3e6f0;
  color: #6c757d;
}
.btn-outline-secondary:hover {
  background-color: #e3e6f0;
  border-color: #d1d3e2;
}

/* Buscador */
.search-box .form-control {
  border-radius: 50px;
  padding-left: 45px;
  height: 45px;
  border: 1px solid #e3e6f0;
}

/* Animaciones */
.animate-fade-in { animation: fadeIn 0.5s ease; }

@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}

/* Responsive */
@media (max-width: 992px) {
  .main-content { margin-left: 0; padding: 1.5rem; }
  .dashboard-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
}

@media (max-width: 768px) {
  .custom-table thead { display: none; }
  .custom-table, .custom-table tbody, .custom-table tr, .custom-table td { 
    display: block; width: 100%; 
  }
  .custom-table tr {
    margin-bottom: 1rem; background: white; border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 1rem; border: 1px solid #e3e6f0;
  }
  .custom-table td {
    padding: 0.5rem 0; text-align: right; border: none; 
    display: flex; justify-content: space-between; align-items: center;
  }
  .custom-table td::before {
    content: attr(data-label); font-weight: 600; color: #858796; font-size: 0.85rem;
  }
}
</style>