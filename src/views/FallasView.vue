<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, onMounted, computed } from 'vue';

const API_BASE = 'http://localhost:3000/api';

// Estados
const fallas = ref([]);
const nombreFallaForm = ref('');
const busqueda = ref('');
const loading = ref(false);

// Estados para Edición
const idEdicion = ref(null); // Si es null, estamos creando. Si tiene ID, editamos.
const esEdicion = computed(() => idEdicion.value !== null);

// Filtro de búsqueda
const fallasFiltradas = computed(() => {
  if (!busqueda.value) return fallas.value;
  return fallas.value.filter(f => 
    f.nombre_falla.toLowerCase().includes(busqueda.value.toLowerCase())
  );
});

// --- FUNCIONES ---

const cargarFallas = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/fallas`);
    const data = await res.json();
    if (data.success) fallas.value = data.data;
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
};

// Guardar (Detecta si es Crear o Actualizar)
const procesarFormulario = async () => {
  if (!nombreFallaForm.value.trim()) return;
  
  const url = esEdicion.value 
    ? `${API_BASE}/fallas/${idEdicion.value}` 
    : `${API_BASE}/fallas`;
    
  const method = esEdicion.value ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre_falla: nombreFallaForm.value })
    });
    const data = await res.json();
    
    if (data.success) {
      alert(data.message);
      cancelarEdicion(); // Limpia el formulario
      cargarFallas();
    } else {
      alert(data.message);
    }
  } catch (e) { alert('Error de conexión'); }
};

// Preparar formulario para editar
const cargarParaEditar = (falla) => {
  idEdicion.value = falla.id_falla;
  nombreFallaForm.value = falla.nombre_falla;
};

// Limpiar formulario / Cancelar edición
const cancelarEdicion = () => {
  idEdicion.value = null;
  nombreFallaForm.value = '';
};

const eliminarFalla = async (id) => {
  if (!confirm('¿Eliminar esta falla del catálogo?')) return;
  
  try {
    const res = await fetch(`${API_BASE}/fallas/${id}`, { method: 'DELETE' });
    const data = await res.json();
    
    if (data.success) {
      cargarFallas();
      // Si estabamos editando justo la que borramos, limpiamos
      if (idEdicion.value === id) cancelarEdicion();
      alert(data.message);
    } else {
      alert("⚠️ " + data.message);
    }
  } catch (e) { alert('Error al intentar eliminar'); }
};

onMounted(cargarFallas);
</script>

<template>
  <div class="dashboard-container">
    <Side />
    <div class="main-content">
      
      <div class="dashboard-header animate-fade-in">
        <div class="header-content">
          <div>
            <h1 class="page-title">Catálogo de Fallas</h1>
            <p class="page-subtitle">Gestiona los tipos de averías comunes</p>
          </div>
          <div class="user-profile">
            <div class="avatar-circle"><i class="fas fa-tools"></i></div>
            <div>
              <div class="user-name">Configuración</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        
        <div class="col-md-4">
          <div class="content-card shadow-sm bg-white h-100 p-4 border-top-accent" :class="esEdicion ? 'border-warning' : 'border-primary'">
            
            <h5 class="fw-bold mb-4" :class="esEdicion ? 'text-warning' : 'text-primary'">
              <i class="fas" :class="esEdicion ? 'fa-edit' : 'fa-plus-circle'"></i>
              {{ esEdicion ? 'Editar Falla' : 'Nueva Falla' }}
            </h5>

            <form @submit.prevent="procesarFormulario">
              <div class="mb-3">
                <label class="form-label text-muted small fw-bold">Nombre de la Falla</label>
                <input 
                  v-model="nombreFallaForm" 
                  type="text" 
                  class="form-control form-control-lg" 
                  placeholder="Ej: Radiador Roto" 
                  required
                >
              </div>

              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn fw-bold shadow-sm text-white"
                  :class="esEdicion ? 'btn-warning' : 'btn-primary'"
                >
                  {{ esEdicion ? 'Actualizar Falla' : 'Guardar Falla' }}
                </button>
                
                <button 
                  v-if="esEdicion" 
                  type="button" 
                  class="btn btn-outline-secondary fw-bold"
                  @click="cancelarEdicion"
                >
                  Cancelar Edición
                </button>
              </div>
            </form>
            
            <div class="mt-4 p-3 bg-light rounded border" :class="esEdicion ? 'border-warning' : ''">
              <small class="text-muted d-block">
                <i class="fas fa-info-circle me-1"></i>
                <span v-if="esEdicion">Estás modificando el nombre de una falla existente. Esto actualizará el nombre en los reportes históricos.</span>
                <span v-else>Solo podrás eliminar una falla si no hay vehículos activos diagnosticados con ella.</span>
              </small>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="content-card shadow-sm bg-white h-100">
            <div class="p-3 border-bottom">
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="fas fa-search text-muted"></i></span>
                <input v-model="busqueda" type="text" class="form-control border-start-0 bg-light" placeholder="Buscar falla...">
              </div>
            </div>

            <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
              <table class="table custom-table mb-0">
                <thead class="sticky-top bg-white">
                  <tr>
                    <th>ID</th>
                    <th>Descripción de la Falla</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in fallasFiltradas" :key="f.id_falla" class="hover-row" :class="{'table-active': idEdicion === f.id_falla}">
                    <td><span class="badge bg-light text-dark border">#{{ f.id_falla }}</span></td>
                    <td class="fw-bold text-dark">{{ f.nombre_falla }}</td>
                    <td class="text-end">
                      <button class="btn btn-icon text-warning me-2" @click="cargarParaEditar(f)" title="Editar">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-icon text-danger" @click="eliminarFalla(f.id_falla)" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="fallasFiltradas.length === 0">
                    <td colspan="3" class="text-center py-4 text-muted">No se encontraron resultados</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Estilos Base (Iguales a los anteriores) */
.dashboard-container { display: flex; min-height: 100vh; background-color: #f3f6f9; font-family: 'Poppins', sans-serif; }
.main-content { flex: 1; padding: 2rem; margin-left: 250px; transition: all 0.3s ease; }
.dashboard-header { background: white; padding: 1.5rem 2rem; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 2rem; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #2c3e50; margin: 0; }
.page-subtitle { color: #95a5a6; font-size: 0.9rem; margin-top: 5px; }
.user-profile { display: flex; align-items: center; gap: 15px; padding: 8px 15px; background: #f8f9fa; border-radius: 50px; }
.avatar-circle { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }

/* Estilos Específicos */
.content-card { border-radius: 16px; overflow: hidden; }
.border-top-accent { border-top: 5px solid transparent; }
.border-primary { border-top-color: #4e73df !important; }
.border-warning { border-top-color: #ffc107 !important; }

.custom-table th { font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: #858796; padding: 1rem; background-color: #f8f9fc; border-bottom: 2px solid #e3e6f0; }
.custom-table td { padding: 1rem; border-bottom: 1px solid #f0f2f5; vertical-align: middle; }
.hover-row:hover { background-color: #f8f9fc; }
.table-active { background-color: #fff3cd !important; } /* Resalta la fila que se está editando */

.btn-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s; border: none; background: transparent; }
.btn-icon:hover { transform: scale(1.1); background-color: #f1f3f9; }

@media (max-width: 992px) { .main-content { margin-left: 0; padding: 1.5rem; } .dashboard-header { flex-direction: column; gap: 1rem; align-items: flex-start; } }
</style>