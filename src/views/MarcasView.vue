<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth'; // Ajusta la ruta según tu estructura

const API_BASE = 'http://localhost:3000/api';
const authStore = useAuthStore();

// --- ESTADOS ---
const marca = reactive({
  id_marca: "",
  nombre_marca: ""
});

const marcas = ref([]);
const cargando = ref(false);
const error = ref(null);
const busqueda = ref('');
const mensaje = ref('');
const marcaEditandoId = ref(null);

// --- COMPUTED ---
const totalMarcas = computed(() => marcas.value.length);

const marcasFiltradas = computed(() => {
  if (!busqueda.value) return marcas.value;
  const lower = busqueda.value.toLowerCase();
  return marcas.value.filter(m => 
    m.id_marca?.toString().toLowerCase().includes(lower) ||
    m.nombre_marca?.toLowerCase().includes(lower)
  );
});

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

// --- MÉTODOS ---
const cargarMarcas = async () => {
  cargando.value = true;
  error.value = null;
  try {
    const res = await fetch(`${API_BASE}/marcas`);
    const data = await res.json();
    if (data.success) {
      marcas.value = data.data;
    } else {
      error.value = 'Error al cargar las marcas';
    }
  } catch (e) {
    console.error('Error al cargar marcas:', e);
    error.value = 'Error de conexión al cargar marcas';
  } finally {
    cargando.value = false;
  }
};

const submitForm = async () => {
  if (!marca.nombre_marca.trim()) {
    mensaje.value = 'El nombre de la marca es requerido';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  const url = marcaEditandoId.value ? `${API_BASE}/marcas/${marcaEditandoId.value}` : `${API_BASE}/marcas`;
  const method = marcaEditandoId.value ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre_marca: marca.nombre_marca })
    });
    const data = await res.json();
    
    if (data.success) {
      await cargarMarcas();
      cancelarEdicion();
      mensaje.value = data.message;
      setTimeout(() => mensaje.value = '', 3000);
    } else {
      error.value = data.message || 'Error al guardar la marca';
    }
  } catch (e) {
    console.error('Error al guardar marca:', e);
    error.value = 'Error de conexión al guardar la marca';
  }
};

const editarMarca = (marcaParaEditar) => {
  Object.assign(marca, {
    id_marca: marcaParaEditar.id_marca,
    nombre_marca: marcaParaEditar.nombre_marca
  });
  marcaEditandoId.value = marcaParaEditar.id_marca;
};

const eliminarMarca = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta marca?')) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/marcas/${id}`, { method: 'DELETE' });
    const data = await res.json();
    
    if (data.success) {
      await cargarMarcas();
      mensaje.value = 'Marca eliminada correctamente';
      setTimeout(() => mensaje.value = '', 3000);
    } else {
      error.value = data.message || 'Error al eliminar la marca';
    }
  } catch (e) {
    console.error('Error al eliminar marca:', e);
    error.value = 'Error de conexión al eliminar la marca';
  }
};

const cancelarEdicion = () => {
  Object.assign(marca, {
    id_marca: "",
    nombre_marca: ""
  });
  marcaEditandoId.value = null;
};

onMounted(() => {
  cargarMarcas();
});
</script>

<template>
  <div class="dashboard-container">
    <Side />
    
    <div class="main-content">
      
      <div class="dashboard-header animate-fade-in">
        <div class="header-content">
          <div>
            <h1 class="page-title">Gestión de Marcas</h1>
            <p class="page-subtitle">Administra las marcas de vehículos disponibles en el sistema</p>
          </div>
          <div class="user-profile">
            <div class="avatar-circle">{{ usuarioIniciales }}</div>
            <div>
              <div class="user-name">{{ nombreCompleto }}</div>
              <div class="user-role">{{ usuarioCargo }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de registro/edición -->
      <div class="content-card shadow-sm bg-white mb-4">
        <div class="p-4">
          <div class="text-center mb-4">
            <div class="client-avatar-large mx-auto mb-3 bg-warning-soft">
              <i class="fas fa-tags text-warning"></i>
            </div>
            <h3 class="fw-bold text-dark">{{ marcaEditandoId !== null ? 'Editar Marca' : 'Registrar Nueva Marca' }}</h3>
            <p class="text-muted">{{ marcaEditandoId !== null ? 'Modifica el nombre de la marca seleccionada' : 'Ingresa el nombre de una nueva marca de vehículo' }}</p>
          </div>
          
          <form @submit.prevent="submitForm">
            <div class="mb-4">
              <label for="nombre_marca" class="form-label fw-bold text-dark">Nombre de la Marca</label>
              <input v-model="marca.nombre_marca" type="text" class="form-control" id="nombre_marca" 
                     placeholder="Ej: Toyota, Ford, Chevrolet..." required />
            </div>
          
            <div class="d-flex justify-content-end gap-2 pt-2">
              <button type="button" class="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold" 
                      @click="cancelarEdicion" v-if="marcaEditandoId !== null">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm">
                {{ marcaEditandoId !== null ? 'Actualizar Marca' : 'Registrar Marca' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="mensaje" class="alert alert-success alert-dismissible fade show mb-4" role="alert">
        <i class="fas fa-check-circle me-2"></i>
        {{ mensaje }}
        <button type="button" class="btn-close" @click="mensaje = ''"></button>
      </div>

      <!-- Tabla de marcas -->
      <div class="content-card shadow-sm bg-white">
        
        <div class="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="search-box position-relative" style="min-width: 250px;">
            <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 50%; transform: translateY(-50%);"></i>
            <input 
              v-model="busqueda" 
              type="text" 
              class="form-control ps-5" 
              placeholder="Buscar por ID o nombre de marca..."
            >
          </div>
        </div>

        <div class="table-responsive">
          <table class="table custom-table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre de la Marca</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="marcaItem in marcasFiltradas" :key="marcaItem.id_marca" class="hover-row">
                <td data-label="ID">
                  <span class="badge bg-light text-dark border fw-bold px-3 py-2">
                    {{ marcaItem.id_marca }}
                  </span>
                </td>
                <td data-label="Nombre">
                  <div class="d-flex align-items-center">
                    <div class="client-avatar-small me-2 bg-warning-soft">
                      <i class="fas fa-tag text-warning"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ marcaItem.nombre_marca }}</div>
                    </div>
                  </div>
                </td>
                <td data-label="Acciones">
                  <div class="d-flex gap-2">
                    <button class="btn-icon" @click="editarMarca(marcaItem)" title="Editar">
                      <i class="fas fa-edit text-warning"></i>
                    </button>
                    <button class="btn-icon" @click="eliminarMarca(marcaItem.id_marca)" title="Eliminar">
                      <i class="fas fa-trash text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Estado de carga -->
              <tr v-if="cargando">
                <td colspan="3" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                  <p class="mt-2 text-muted">Cargando marcas...</p>
                </td>
              </tr>
              
              <!-- Error -->
              <tr v-else-if="error">
                <td colspan="3" class="text-center py-5 text-danger">
                  <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                  <p>{{ error }}</p>
                </td>
              </tr>
              
              <!-- Sin resultados -->
              <tr v-else-if="marcasFiltradas.length === 0 && !cargando">
                <td colspan="3" class="text-center py-5 text-muted">
                  <i class="fas fa-tags fa-3x mb-3 opacity-50"></i>
                  <p>No se encontraron marcas</p>
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
/* ESTILOS BASE - Mismos que las otras vistas */
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
  font-weight: bold;
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

.warning-card { border-left-color: #f6c23e; }

.metric-value { font-size: 2rem; font-weight: 700; color: #2c3e50; line-height: 1.2; }
.metric-label { color: #858796; font-size: 0.9rem; margin-top: 5px; font-weight: 500; }

.metric-icon-container {
  width: 60px; height: 60px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
}
.bg-warning-soft { background-color: rgba(246, 194, 62, 0.1); }
.bg-success-soft { background-color: rgba(28, 200, 138, 0.1); }
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

/* Alerta */
.alert-success {
  background-color: rgba(28, 200, 138, 0.1);
  border: 1px solid rgba(28, 200, 138, 0.2);
  color: #1cc88a;
  border-radius: 10px;
}

.alert-danger {
  background-color: rgba(231, 74, 59, 0.1);
  border: 1px solid rgba(231, 74, 59, 0.2);
  color: #e74a3b;
  border-radius: 10px;
}

/* Buscador */
.search-box .form-control {
  border-radius: 50px;
  padding-left: 45px;
  height: 45px;
  border: 1px solid #e3e6f0;
}

/* Badges */
.badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35em 0.65em;
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