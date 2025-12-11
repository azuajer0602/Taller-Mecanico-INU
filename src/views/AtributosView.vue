<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, onMounted, computed } from 'vue';

const API_BASE = 'http://localhost:3000/api';

// Estados
const atributos = ref([]);
const nombreForm = ref('');
const busqueda = ref('');
const loading = ref(false);

// Estados para Edición
const idEdicion = ref(null);
const esEdicion = computed(() => idEdicion.value !== null);

// Filtro de búsqueda
const listaFiltrada = computed(() => {
  if (!busqueda.value) return atributos.value;
  return atributos.value.filter(a => 
    a.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
  );
});

// --- FUNCIONES ---

const cargarAtributos = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/atributos`);
    const data = await res.json();
    if (data.success) atributos.value = data.data;
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
};

const procesarFormulario = async () => {
  if (!nombreForm.value.trim()) return;
  
  const url = esEdicion.value 
    ? `${API_BASE}/atributos/${idEdicion.value}` 
    : `${API_BASE}/atributos`;
    
  const method = esEdicion.value ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombreForm.value })
    });
    const data = await res.json();
    
    if (data.success) {
      alert(data.message);
      cancelarEdicion();
      cargarAtributos();
    } else {
      alert(data.message);
    }
  } catch (e) { alert('Error de conexión'); }
};

const cargarParaEditar = (item) => {
  idEdicion.value = item.id_atributo;
  nombreForm.value = item.nombre;
};

const cancelarEdicion = () => {
  idEdicion.value = null;
  nombreForm.value = '';
};

const eliminarAtributo = async (id) => {
  if (!confirm('¿Eliminar este item del checklist?')) return;
  
  try {
    const res = await fetch(`${API_BASE}/atributos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    
    if (data.success) {
      cargarAtributos();
      if (idEdicion.value === id) cancelarEdicion();
      alert(data.message);
    } else {
      alert("⚠️ " + data.message);
    }
  } catch (e) { alert('Error al intentar eliminar'); }
};

onMounted(cargarAtributos);
</script>

<template>
  <div class="dashboard-container">
    <Side />
    <div class="main-content">
      
      <div class="dashboard-header animate-fade-in">
        <div class="header-content">
          <div>
            <h1 class="page-title">Checklist de Inspección</h1>
            <p class="page-subtitle">Gestiona los puntos a revisar en cada vehículo</p>
          </div>
          <div class="user-profile">
            <div class="avatar-circle"><i class="fas fa-clipboard-check"></i></div>
            <div>
              <div class="user-name">Configuración</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        
        <div class="col-md-4">
          <div class="content-card shadow-sm bg-white h-100 p-4 border-top-accent" :class="esEdicion ? 'border-warning' : 'border-success'">
            
            <h5 class="fw-bold mb-4" :class="esEdicion ? 'text-warning' : 'text-success'">
              <i class="fas" :class="esEdicion ? 'fa-edit' : 'fa-plus-circle'"></i>
              {{ esEdicion ? 'Editar Item' : 'Nuevo Item' }}
            </h5>

            <form @submit.prevent="procesarFormulario">
              <div class="mb-3">
                <label class="form-label text-muted small fw-bold">Nombre del Atributo</label>
                <input 
                  v-model="nombreForm" 
                  type="text" 
                  class="form-control form-control-lg" 
                  placeholder="Ej: Nivel de Aceite" 
                  required
                >
              </div>

              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn fw-bold shadow-sm text-white"
                  :class="esEdicion ? 'btn-warning' : 'btn-success'"
                >
                  {{ esEdicion ? 'Actualizar' : 'Agregar a la Lista' }}
                </button>
                
                <button 
                  v-if="esEdicion" 
                  type="button" 
                  class="btn btn-outline-secondary fw-bold"
                  @click="cancelarEdicion"
                >
                  Cancelar
                </button>
              </div>
            </form>
            
            <div class="mt-4 p-3 bg-light rounded border border-success bg-opacity-10">
              <small class="text-muted d-block">
                <i class="fas fa-info-circle me-1 text-success"></i>
                Estos elementos aparecerán en el formulario de diagnóstico para que el mecánico indique su estado (Bueno/Malo/Regular).
              </small>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="content-card shadow-sm bg-white h-100">
            <div class="p-3 border-bottom">
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="fas fa-search text-muted"></i></span>
                <input v-model="busqueda" type="text" class="form-control border-start-0 bg-light" placeholder="Buscar atributo...">
              </div>
            </div>

            <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
              <table class="table custom-table mb-0">
                <thead class="sticky-top bg-white">
                  <tr>
                    <th>ID</th>
                    <th>Elemento a Revisar</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="a in listaFiltrada" :key="a.id_atributo" class="hover-row" :class="{'table-active': idEdicion === a.id_atributo}">
                    <td><span class="badge bg-light text-dark border">#{{ a.id_atributo }}</span></td>
                    <td class="fw-bold text-dark">{{ a.nombre }}</td>
                    <td class="text-end">
                      <button class="btn btn-icon text-warning me-2" @click="cargarParaEditar(a)" title="Editar">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-icon text-danger" @click="eliminarAtributo(a.id_atributo)" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="listaFiltrada.length === 0">
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
/* ESTILOS (Reutilizando tu tema Dashboard) */
.dashboard-container { display: flex; min-height: 100vh; background-color: #f3f6f9; font-family: 'Poppins', sans-serif; }
.main-content { flex: 1; padding: 2rem; margin-left: 250px; transition: all 0.3s ease; }
.dashboard-header { background: white; padding: 1.5rem 2rem; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 2rem; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #2c3e50; margin: 0; }
.page-subtitle { color: #95a5a6; font-size: 0.9rem; margin-top: 5px; }
.user-profile { display: flex; align-items: center; gap: 15px; padding: 8px 15px; background: #f8f9fa; border-radius: 50px; }
.avatar-circle { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }

.content-card { border-radius: 16px; overflow: hidden; }
.border-top-accent { border-top: 5px solid transparent; }
.border-success { border-top-color: #1cc88a !important; } /* Verde para atributos (Checklist) */
.border-warning { border-top-color: #ffc107 !important; }

.custom-table th { font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: #858796; padding: 1rem; background-color: #f8f9fc; border-bottom: 2px solid #e3e6f0; }
.custom-table td { padding: 1rem; border-bottom: 1px solid #f0f2f5; vertical-align: middle; }
.hover-row:hover { background-color: #f8f9fc; }
.table-active { background-color: #fff3cd !important; }

.btn-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s; border: none; background: transparent; }
.btn-icon:hover { transform: scale(1.1); background-color: #f1f3f9; }

@media (max-width: 992px) { .main-content { margin-left: 0; padding: 1.5rem; } .dashboard-header { flex-direction: column; gap: 1rem; align-items: flex-start; } }
</style>