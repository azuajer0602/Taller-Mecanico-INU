<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, reactive, computed, onMounted } from 'vue';

const API_BASE = 'http://localhost:3000/api';

// --- ESTADOS ---
const vehiculos = ref([]);
const listaMarcas = ref([]);

// Estado del formulario
const vehiculo = reactive({
  matricula: '', // Usamos matricula como ID
  id_marca: '',
  modelo: '',
  año: new Date().getFullYear(),
  color: '',
  id_cliente: null,
  nombre_cliente_display: '' // Para el input buscador
});

// Estados de UI
const loading = ref(false);
const mostrarModal = ref(false); // Ahora usaremos un Modal en lugar de card colapsable
const vehiculoEditando = ref(false);
const busqueda = ref(''); // Filtro general de la tabla

// Estados del Buscador de Clientes (Typeahead)
const sugerenciasClientes = ref([]);
const buscandoClienteAPI = ref(false);
const mostrarSugerencias = ref(false);

// --- COMPUTED ---
// Estadísticas para las tarjetas superiores
const totalVehiculos = computed(() => vehiculos.value.length);
const vehiculosEnTaller = computed(() => vehiculos.value.filter(v => v.activo).length);

// Filtro de tabla
const vehiculosFiltrados = computed(() => {
  if (!busqueda.value) return vehiculos.value;
  const lower = busqueda.value.toLowerCase();
  return vehiculos.value.filter(v => 
    v.matricula.toLowerCase().includes(lower) ||
    v.modelo.toLowerCase().includes(lower) ||
    (v.marca_detalle?.nombre_marca || '').toLowerCase().includes(lower) ||
    (v.cliente_detalle?.nombre || '').toLowerCase().includes(lower)
  );
});

// Validación
const formValido = computed(() => {
  return vehiculo.matricula.length >= 3 && 
         vehiculo.id_marca && 
         vehiculo.modelo && 
         vehiculo.año && 
         vehiculo.id_cliente;
});

// --- MÉTODOS DE CARGA ---
const cargarData = async () => {
  loading.value = true;
  await Promise.all([cargarVehiculos(), cargarMarcas()]);
  loading.value = false;
};

const cargarVehiculos = async () => {
  try {
    const res = await fetch(`${API_BASE}/vehiculos`);
    const data = await res.json();
    if(data.success) vehiculos.value = data.data;
  } catch (e) { console.error(e); }
};

const cargarMarcas = async () => {
  try {
    const res = await fetch(`${API_BASE}/marcas`);
    const data = await res.json();
    if(data.success) listaMarcas.value = data.data;
  } catch (e) { console.error(e); }
};

// --- LÓGICA BUSCADOR CLIENTES (AUTOCOMPLETADO) ---
const buscarClienteInput = async () => {
  const termino = vehiculo.nombre_cliente_display;
  
  if (!termino || termino.length < 2) {
    sugerenciasClientes.value = [];
    mostrarSugerencias.value = false;
    if (termino.length === 0) vehiculo.id_cliente = null;
    return;
  }

  buscandoClienteAPI.value = true;
  try {
    const res = await fetch(`${API_BASE}/clientes/buscar?q=${termino}`);
    const data = await res.json();
    const resultados = data.body || data.data || []; // Ajusta según tu backend
    sugerenciasClientes.value = Array.isArray(resultados) ? resultados : [];
    mostrarSugerencias.value = true;
  } catch (error) {
    console.error(error);
  } finally {
    buscandoClienteAPI.value = false;
  }
};

const seleccionarCliente = (c) => {
  vehiculo.id_cliente = c.id_cliente;
  vehiculo.nombre_cliente_display = `${c.nombre} ${c.apellido} (${c.cedula})`;
  mostrarSugerencias.value = false;
};

// --- CRUD VEHÍCULO ---
const abrirModal = (editar = false, item = null) => {
  mostrarModal.value = true;
  vehiculoEditando.value = editar;
  
  if (editar && item) {
    // Rellenar datos
    vehiculo.matricula = item.matricula;
    vehiculo.id_marca = item.id_marca;
    vehiculo.modelo = item.modelo;
    vehiculo.año = item.afio;
    vehiculo.color = item.color;
    vehiculo.id_cliente = item.id_cliente;
    
    if (item.cliente_detalle) {
      vehiculo.nombre_cliente_display = `${item.cliente_detalle.nombre} ${item.cliente_detalle.apellido} (${item.cliente_detalle.cedula})`;
    }
  } else {
    // Limpiar
    Object.assign(vehiculo, {
      matricula: '', id_marca: '', modelo: '', 
      año: new Date().getFullYear(), color: '', 
      id_cliente: null, nombre_cliente_display: ''
    });
  }
};

const guardarVehiculo = async () => {
  if (!formValido.value) return;

  const payload = {
    matricula: vehiculo.matricula.toUpperCase().trim(),
    id_marca: vehiculo.id_marca,
    modelo: vehiculo.modelo,
    afio: vehiculo.año,
    color: vehiculo.color,
    id_cliente: vehiculo.id_cliente
  };

  const url = vehiculoEditando.value 
    ? `${API_BASE}/vehiculos/${vehiculo.matricula}`
    : `${API_BASE}/vehiculos`;
    
  const method = vehiculoEditando.value ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    if (data.success) {
      alert(vehiculoEditando.value ? 'Vehículo actualizado' : 'Vehículo registrado');
      mostrarModal.value = false;
      cargarVehiculos();
    } else {
      alert(data.message);
    }
  } catch (e) {
    alert('Error al guardar');
  }
};

const eliminarVehiculo = async (id) => {
  if(!confirm('¿Eliminar este vehículo?')) return;
  try {
    const res = await fetch(`${API_BASE}/vehiculos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if(data.success) cargarVehiculos();
    else alert(data.message);
  } catch (e) { alert('Error al eliminar'); }
};

onMounted(cargarData);
</script>

<template>
  <div class="dashboard-container">
    <Side />
    
    <div class="main-content">
      
      <div class="dashboard-header animate-fade-in">
        <div class="header-content">
          <div>
            <h1 class="page-title">Gestión de Vehículos</h1>
            <p class="page-subtitle">Administra la flota y asignaciones de clientes</p>
          </div>
          <div class="user-profile">
            <div class="avatar-circle">A</div>
            <div>
              <div class="user-name">Administrador</div>
              <div class="user-role">MecanoSoft</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4 g-3">
        <div class="col-md-6 col-lg-6">
          <div class="metric-card primary-card h-100">
            <div>
              <div class="metric-value">{{ totalVehiculos }}</div>
              <div class="metric-label">Vehículos Registrados</div>
            </div>
            <div class="metric-icon-container bg-primary-soft">
              <i class="fas fa-car text-primary"></i>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-6">
          <div class="metric-card success-card h-100">
            <div>
              <div class="metric-value">{{ vehiculosEnTaller }}</div>
              <div class="metric-label">En Taller (Activos)</div>
            </div>
            <div class="metric-icon-container bg-success-soft">
              <i class="fas fa-tools text-success"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card shadow-sm bg-white">
        
        <div class="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="search-box position-relative" style="min-width: 250px;">
            <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 50%; transform: translateY(-50%);"></i>
            <input 
              v-model="busqueda" 
              type="text" 
              class="form-control ps-5" 
              placeholder="Buscar placa, modelo o cliente..."
            >
          </div>
          <button class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm" @click="abrirModal(false)">
            <i class="fas fa-plus me-2"></i> Nuevo Vehículo
          </button>
        </div>

        <div class="table-responsive">
          <table class="table custom-table mb-0">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Vehículo</th>
                <th>Propietario</th>
                <th>Año / Color</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in vehiculosFiltrados" :key="v.matricula" class="hover-row">
                <td data-label="Placa">
                  <span class="badge bg-light text-dark border fw-bold px-3 py-2">
                    {{ v.matricula }}
                  </span>
                </td>
                <td data-label="Vehículo">
                  <div class="d-flex align-items-center">
                    <div class="client-avatar-small me-2">
                      <i class="fas fa-car-side"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ v.marca_detalle?.nombre_marca }}</div>
                      <div class="text-muted small">{{ v.modelo }}</div>
                    </div>
                  </div>
                </td>
                <td data-label="Propietario">
                  <div v-if="v.cliente_detalle">
                    <div class="fw-bold text-dark">{{ v.cliente_detalle.nombre }} {{ v.cliente_detalle.apellido }}</div>
                    <div class="text-muted small">CI: {{ v.cliente_detalle.cedula }}</div>
                  </div>
                  <span v-else class="text-muted fst-italic">Sin asignar</span>
                </td>
                <td data-label="Detalles">
                  <div class="d-flex flex-column">
                    <span class="small"><i class="fas fa-calendar me-1 text-muted"></i> {{ v.afio }}</span>
                    <span class="small"><i class="fas fa-palette me-1 text-muted"></i> {{ v.color }}</span>
                  </div>
                </td>
                <td data-label="Estado">
                  <span v-if="v.activo" class="badge bg-success-soft text-success px-3 rounded-pill">
                    En Taller
                  </span>
                  <span v-else class="badge bg-secondary-soft text-secondary px-3 rounded-pill">
                    Inactivo
                  </span>
                </td>
                <td data-label="Acciones" class="text-end">
                  <button class="btn btn-icon text-warning me-2" @click="abrirModal(true, v)" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-icon text-danger" @click="eliminarVehiculo(v.matricula)" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="vehiculosFiltrados.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                  <p>No se encontraron vehículos</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
      <div class="modal-card animate-slide-up">
        <div class="modal-header">
          <h5 class="fw-bold m-0">
            <i class="fas fa-car me-2 text-primary"></i>
            {{ vehiculoEditando ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo' }}
          </h5>
          <button class="btn-close" @click="mostrarModal = false"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="guardarVehiculo">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold text-muted">Placa</label>
                <input 
                  v-model="vehiculo.matricula" 
                  type="text" 
                  class="form-control" 
                  :disabled="vehiculoEditando"
                  placeholder="Ej: AB123CD"
                  required
                >
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-muted">Marca</label>
                <select v-model="vehiculo.id_marca" class="form-select" required>
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="m in listaMarcas" :key="m.id_marca" :value="m.id_marca">
                    {{ m.nombre_marca }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-muted">Modelo</label>
                <input v-model="vehiculo.modelo" type="text" class="form-control" placeholder="Ej: Corolla" required>
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-bold text-muted">Año</label>
                <input v-model="vehiculo.año" type="number" class="form-control" required>
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-bold text-muted">Color</label>
                <input v-model="vehiculo.color" type="text" class="form-control" placeholder="Rojo">
              </div>

              <div class="col-12 position-relative">
                <label class="form-label small fw-bold text-muted">Cliente Propietario</label>
                <div class="input-group">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="fas" :class="buscandoClienteAPI ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control border-start-0 ps-0" 
                    v-model="vehiculo.nombre_cliente_display"
                    @input="buscarClienteInput"
                    placeholder="Buscar por cédula o nombre..."
                    :class="{'is-valid': vehiculo.id_cliente}"
                    autocomplete="off"
                  >
                  <button v-if="vehiculo.id_cliente" class="btn btn-outline-secondary" type="button" @click="vehiculo.id_cliente = null; vehiculo.nombre_cliente_display = ''">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                
                <div v-if="mostrarSugerencias && sugerenciasClientes.length > 0" class="suggestions-dropdown shadow-sm">
                  <div 
                    v-for="c in sugerenciasClientes" 
                    :key="c.id_cliente"
                    class="suggestion-item"
                    @click="seleccionarCliente(c)"
                  >
                    <div class="fw-bold text-dark">{{ c.nombre }} {{ c.apellido }}</div>
                    <div class="small text-muted">CI: {{ c.cedula }}</div>
                  </div>
                </div>
                
                <div v-if="vehiculo.id_cliente" class="form-text text-success">
                  <i class="fas fa-check-circle"></i> Cliente asignado.
                </div>
              </div>

            </div>
            
            <div class="modal-footer border-0 px-0 pb-0 mt-4">
              <button type="button" class="btn btn-light text-muted" @click="mostrarModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary px-4 fw-bold" :disabled="!formValido">
                {{ vehiculoEditando ? 'Actualizar' : 'Registrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ESTILOS BASE (Copiados y adaptados de tu referencia) */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f3f6f9;
  font-family: 'Poppins', sans-serif;
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-left: 250px; /* Asumiendo que tu sidebar mide esto */
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

.primary-card { border-left-color: #4e73df; }
.success-card { border-left-color: #1cc88a; }

.metric-value { font-size: 2rem; font-weight: 700; color: #2c3e50; line-height: 1.2; }
.metric-label { color: #858796; font-size: 0.9rem; margin-top: 5px; font-weight: 500; }

.metric-icon-container {
  width: 60px; height: 60px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
}
.bg-primary-soft { background-color: rgba(78, 115, 223, 0.1); }
.bg-success-soft { background-color: rgba(28, 200, 138, 0.1); }
.bg-secondary-soft { background-color: rgba(108, 117, 125, 0.1); }

/* Tabla */
.content-card { border-radius: 16px; overflow: hidden; }
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

/* MODAL PERSONALIZADO (Para mantener el estilo limpio) */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(2px);
  z-index: 1050; display: flex; justify-content: center; align-items: center;
}
.modal-card {
  background: white; width: 90%; max-width: 600px;
  border-radius: 20px; padding: 2rem;
  box-shadow: 0 15px 50px rgba(0,0,0,0.1);
  max-height: 90vh; overflow-y: auto;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }

/* AUTOCOMPLETADO (Suggestions) */
.suggestions-dropdown {
  position: absolute; top: 100%; left: 0; width: 100%;
  background: white; border: 1px solid #e3e6f0;
  border-radius: 0 0 10px 10px; z-index: 1000;
  max-height: 200px; overflow-y: auto;
}
.suggestion-item {
  padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #f8f9fc;
}
.suggestion-item:hover { background-color: #f1f3f9; }

/* Animaciones */
.animate-fade-in { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Responsive */
@media (max-width: 992px) {
  .main-content { margin-left: 0; padding: 1.5rem; }
  .dashboard-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
}

@media (max-width: 768px) {
  .custom-table thead { display: none; }
  .custom-table, .custom-table tbody, .custom-table tr, .custom-table td { display: block; width: 100%; }
  .custom-table tr {
    margin-bottom: 1rem; background: white; border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 1rem; border: 1px solid #e3e6f0;
  }
  .custom-table td {
    padding: 0.5rem 0; text-align: right; border: none; display: flex; justify-content: space-between; align-items: center;
  }
  .custom-table td::before {
    content: attr(data-label); font-weight: 600; color: #858796; font-size: 0.85rem;
  }
}
</style>