<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/auth';

// --- ESTADOS ---
const empleado = reactive({
  usuario: "",
  contrasena: "",
  nombre: "",
  apellido: "",
  cedula: "",
  cargo: "",
  fechaContratacion: "",
  sueldo: ""
});

const empleados = ref([]);
const cargando = ref(false);
const error = ref(null);
const busqueda = ref('');
const empleadoEditandoId = ref(null);

// --- COMPUTED ---
const totalEmpleados = computed(() => empleados.value.length);

const empleadosFiltrados = computed(() => {
  if (!busqueda.value) return empleados.value;
  const lower = busqueda.value.toLowerCase();
  return empleados.value.filter(e => 
    e.usuario?.toLowerCase().includes(lower) ||
    e.nombre_emp?.toLowerCase().includes(lower) ||
    e.apellido_emp?.toLowerCase().includes(lower) ||
    e.cargo?.toLowerCase().includes(lower) ||
    e.cedula_emp?.toString().toLowerCase().includes(lower)
  );
});

// --- MÉTODOS ---
const cargarEmpleados = async () => {
  cargando.value = true;
  error.value = null;
  try {
    const response = await axios.get(`${API_BASE_URL}/obtener`);
    empleados.value = response.data.empleados || response.data;
  } catch (err) {
    console.error('Error al cargar empleados:', err);
    error.value = `Error: ${err.response?.status || 'Conexión'} - ${err.response?.data?.message || err.message}`;
  } finally {
    cargando.value = false;
  }
};

const submitForm = async () => {
  try {
    const fechaFormateada = empleado.fechaContratacion
      .replace(/-/g, '')
      .substring(0, 8);
    
    const datosParaEnviar = {
      usuario: empleado.usuario,
      password: empleado.contrasena,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      cedula: empleado.cedula,
      cargo: empleado.cargo,
      contratacion: fechaFormateada,
      sueldo: parseFloat(empleado.sueldo) || 0
    };

    if (empleadoEditandoId.value !== null) {
      datosParaEnviar.id = empleadoEditandoId.value;
      await axios.put(`${API_BASE_URL}/update`, datosParaEnviar);
    } else {
      await axios.post(`${API_BASE_URL}/register`, datosParaEnviar);
    }
    
    await cargarEmpleados();
    cancelarEdicion();
    alert(empleadoEditandoId.value !== null ? 'Empleado actualizado' : 'Empleado registrado');
    
  } catch (err) {
    console.error('Error al guardar empleado:', err);
    alert('Error: ' + (err.response?.data?.message || err.message));
  }
};

const editarEmpleado = (empleadoParaEditar) => {
  Object.assign(empleado, {
    usuario: empleadoParaEditar.usuario,
    contrasena: "",
    nombre: empleadoParaEditar.nombre_emp,
    apellido: empleadoParaEditar.apellido_emp,
    cedula: empleadoParaEditar.cedula_emp,
    cargo: empleadoParaEditar.cargo,
    fechaContratacion: empleadoParaEditar.fecha_contratacion,
    sueldo: empleadoParaEditar.sueldo_base
  });
  
  empleadoEditandoId.value = empleadoParaEditar.id_empleado;
};

const eliminarEmpleado = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/delete`, {
      data: { id: id }
    });
    
    await cargarEmpleados();
    alert('Empleado eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    alert('Error: ' + (error.response?.data?.message || error.message));
  }
};

const cancelarEdicion = () => {
  Object.assign(empleado, {
    usuario: "",
    contrasena: "",
    nombre: "",
    apellido: "",
    cedula: "",
    cargo: "",
    fechaContratacion: "",
    sueldo: ""
  });
  empleadoEditandoId.value = null;
};

onMounted(() => {
  cargarEmpleados();
});
</script>

<template>
  <div class="dashboard-container">
    <Side />
    
    <div class="main-content">
      
      <div class="dashboard-header animate-fade-in">
        <div class="header-content">
          <div>
            <h1 class="page-title">Gestión de Empleados</h1>
            <p class="page-subtitle">Administra el personal del taller mecánico</p>
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

      <!-- Formulario de registro/edición -->
      <div class="content-card shadow-sm bg-white mb-4">
        <div class="p-4">
          <div class="text-center mb-4">
            <div class="client-avatar-large mx-auto mb-3 bg-success-soft">
              <i class="fas fa-user-tie text-success"></i>
            </div>
            <h3 class="fw-bold text-dark">{{ empleadoEditandoId !== null ? 'Editar Empleado' : 'Registrar Nuevo Empleado' }}</h3>
            <p class="text-muted">{{ empleadoEditandoId !== null ? 'Modifica los datos del empleado seleccionado' : 'Ingresa los datos del nuevo colaborador del taller' }}</p>
          </div>
          
          <form @submit.prevent="submitForm">
            <div class="row g-3 mb-3">
              <div class="col-md-4">
                <label for="usuario" class="form-label fw-bold text-dark">Usuario (Login)</label>
                <input v-model="empleado.usuario" type="text" class="form-control" id="usuario" 
                       placeholder="Ingresar nombre de usuario" required />
              </div>
              <div class="col-md-4">
                <label for="contrasena" class="form-label fw-bold text-dark">Contraseña</label>
                <input v-model="empleado.contrasena" type="password" class="form-control" id="contrasena" 
                       placeholder="Ingresar contraseña" :required="empleadoEditandoId === null" />
              </div>
              <div class="col-md-4">
                <label for="cedula" class="form-label fw-bold text-dark">Cédula</label>
                <input v-model="empleado.cedula" type="text" class="form-control" id="cedula" 
                       placeholder="Ingresar cédula" required />
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label for="nombre" class="form-label fw-bold text-dark">Nombre</label>
                <input v-model="empleado.nombre" type="text" class="form-control" id="nombre" 
                       placeholder="Ingresar nombre" required />
              </div>
              <div class="col-md-6">
                <label for="apellido" class="form-label fw-bold text-dark">Apellido</label>
                <input v-model="empleado.apellido" type="text" class="form-control" id="apellido" 
                       placeholder="Ingresar apellido" required />
              </div>
            </div>
            
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label for="cargo" class="form-label fw-bold text-dark">Cargo</label>
                <select v-model="empleado.cargo" class="form-control" id="cargo" required>
                  <option value="" disabled>Selecciona un cargo</option>
                  <option value="Mecanico">Mecánico</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="fechaContratacion" class="form-label fw-bold text-dark">Fecha de Contratación</label>
                <input v-model="empleado.fechaContratacion" type="date" class="form-control" 
                       id="fechaContratacion" required />
              </div>
            </div>
            
            <div class="mb-4">
              <label for="sueldo" class="form-label fw-bold text-dark">Sueldo Base (Bs)</label>
              <input v-model="empleado.sueldo" type="number" step="0.01" class="form-control" 
                     id="sueldo" placeholder="Ingresar sueldo base" required />
            </div>

            <div class="d-flex justify-content-end gap-2 pt-2">
              <button type="button" class="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold" 
                      @click="cancelarEdicion" v-if="empleadoEditandoId !== null">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm">
                {{ empleadoEditandoId !== null ? 'Actualizar Empleado' : 'Registrar Empleado' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="row mb-4 g-3">
        <div class="col-md-12">
          <div class="metric-card success-card h-100">
            <div>
              <div class="metric-value">{{ totalEmpleados }}</div>
              <div class="metric-label">Empleados Registrados</div>
            </div>
            <div class="metric-icon-container bg-success-soft">
              <i class="fas fa-users text-success"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de empleados -->
      <div class="content-card shadow-sm bg-white">
        
        <div class="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="search-box position-relative" style="min-width: 250px;">
            <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 50%; transform: translateY(-50%);"></i>
            <input 
              v-model="busqueda" 
              type="text" 
              class="form-control ps-5" 
              placeholder="Buscar por usuario, nombre, apellido o cargo..."
            >
          </div>
        </div>

        <div class="table-responsive">
          <table class="table custom-table mb-0">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Cédula</th>
                <th>Cargo</th>
                <th>Fecha Contratación</th>
                <th>Sueldo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in empleadosFiltrados" :key="emp.id_empleado" class="hover-row">
                <td data-label="Usuario">
                  <div class="d-flex align-items-center">
                    <div class="client-avatar-small me-2 bg-success-soft">
                      <i class="fas fa-user text-success"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ emp.usuario }}</div>
                    </div>
                  </div>
                </td>
                <td data-label="Nombre">
                  <div class="fw-bold text-dark">{{ emp.nombre_emp }}</div>
                </td>
                <td data-label="Apellido">
                  <div class="text-dark">{{ emp.apellido_emp }}</div>
                </td>
                <td data-label="Cédula">
                  <div class="text-muted small">{{ emp.cedula_emp }}</div>
                </td>
                <td data-label="Cargo">
                  <div :class="{
                    'badge': true,
                    'bg-primary-soft text-primary px-3 rounded-pill': emp.cargo === 'Administrador',
                    'bg-info-soft text-info px-3 rounded-pill': emp.cargo === 'Mecanico'
                  }">
                    {{ emp.cargo }}
                  </div>
                </td>
                <td data-label="Fecha Contratación">
                  <div class="text-dark">
                    <i class="fas fa-calendar-alt me-2 text-muted"></i>
                    {{ emp.fecha_contratacion }}
                  </div>
                </td>
                <td data-label="Sueldo">
                  <div class="fw-bold text-dark">
                    {{ parseFloat(emp.sueldo_base || 0).toLocaleString('es-VE', { style: 'currency', currency: 'VES' }) }}
                  </div>
                </td>
                <td data-label="Acciones">
                  <div class="d-flex gap-2">
                    <button class="btn-icon" @click="editarEmpleado(emp)" title="Editar">
                      <i class="fas fa-edit text-warning"></i>
                    </button>
                    <button class="btn-icon" @click="eliminarEmpleado(emp.id_empleado)" title="Eliminar">
                      <i class="fas fa-trash text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Estado de carga -->
              <tr v-if="cargando">
                <td colspan="8" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                  <p class="mt-2 text-muted">Cargando empleados...</p>
                </td>
              </tr>
              
              <!-- Error -->
              <tr v-else-if="error">
                <td colspan="8" class="text-center py-5 text-danger">
                  <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                  <p>{{ error }}</p>
                </td>
              </tr>
              
              <!-- Sin resultados -->
              <tr v-else-if="empleadosFiltrados.length === 0 && !cargando">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fas fa-users fa-3x mb-3 opacity-50"></i>
                  <p>No se encontraron empleados</p>
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

.success-card { border-left-color: #1cc88a; }

.metric-value { font-size: 2rem; font-weight: 700; color: #2c3e50; line-height: 1.2; }
.metric-label { color: #858796; font-size: 0.9rem; margin-top: 5px; font-weight: 500; }

.metric-icon-container {
  width: 60px; height: 60px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
}
.bg-success-soft { background-color: rgba(28, 200, 138, 0.1); }
.bg-primary-soft { background-color: rgba(78, 115, 223, 0.1); }
.bg-info-soft { background-color: rgba(54, 185, 204, 0.1); }
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

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%236c757d' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  padding-right: 2.5rem;
}

input[type="date"].form-control {
  appearance: none;
  padding-right: 2.5rem;
}

input[type="password"].form-control {
  letter-spacing: 1px;
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