<script setup>
import Side from '../components/SidebarComponent.vue';
import { reactive, ref, onMounted } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/auth';

const empleado = reactive({
  usuario: "",
  contrasena: "",
  nombre: "",
  apellido: "",
  cedula: "",  
  cargo: "",
  fechaContratacion: "",
  sueldo: ""
})


const empleados = ref([]);
const cargando = ref(false);
const error = ref(null);


const empleadoEditandoId = ref(null);

const cargarEmpleados = async () => {
  cargando.value = true;
  error.value = null;
  try {
    console.log('🔄 Cargando empleados desde:', `${API_BASE_URL}/obtener`);
    const response = await axios.get(`${API_BASE_URL}/obtener`);
    
    // Tu API devuelve { message, empleados }
    empleados.value = response.data.empleados || response.data;
    console.log("✅ Empleados cargados:", empleados.value);
    
  } catch (err) {
    console.error('❌ Error al cargar los empleados:', err);
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
      sueldo: empleado.sueldo
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
    console.error('❌ Error al guardar empleado:', err);
    alert('Error: ' + (err.response?.data?.message || err.message));
  }
}

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
  document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
}

const eliminarEmpleado = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
    return;
  }

  try {
    console.log("Eliminando empleado ID:", id);
   
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
}

onMounted(() => {
  cargarEmpleados();
});
</script>

<template>
  <Side/>
  <div class="main-content">
    
  
    <div class="form-container">
      <div class="card employee-form-card p-4 shadow-lg">
        
        <div class="text-center mb-4">
          <i class="fas fa-id-badge form-icon"></i>
          <h3 class="form-title">{{ empleadoEditandoId !== null ? 'Editar Empleado' : 'Registro de Nuevo Empleado' }}</h3>
          <p class="form-subtitle">{{ empleadoEditandoId !== null ? 'Modifica los datos del empleado seleccionado.' : 'Ingresa los datos del nuevo colaborador para el sistema.' }}</p>
        </div>
        
        <form @submit.prevent="submitForm">

          <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label for="username" class="form-label">Usuario (Login)</label>
            <input v-model="empleado.usuario" type="text" class="form-control form-control-lg" id="username" placeholder="Ingresar nombre de usuario" required />
          </div>
          <div class="col-md-4">
            <label for="username" class="form-label">Contraseña (Login)</label>
            <input v-model="empleado.contrasena" type="text" class="form-control form-control-lg" id="username" placeholder="Ingresar Contraseña de usuario" required />
          </div>
           <div class="col-md-4">
            <label for="username" class="form-label">Cedula</label>
            <input v-model="empleado.cedula" type="text" class="form-control form-control-lg" id="username" placeholder="Ingresar Cedula" required />
          </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="name" class="form-label">Nombre</label>
              <input v-model="empleado.nombre" type="text" class="form-control" id="name" placeholder="Ingresar Nombre" required />
            </div>
            <div class="col-md-6">
              <label for="lastname" class="form-label">Apellido</label>
              <input v-model="empleado.apellido" type="text" class="form-control" id="lastname" placeholder="Ingresar Apellido" required />
            </div>
          </div>
          
          <div class="row g-3 mb-3">
    <div class="col-md-6">
        <label for="position" class="form-label">Cargo</label>
        
        <select 
            v-model="empleado.cargo" 
            class="form-control" 
            id="position" 
            required
        >
            <option value="" disabled>Selecciona un Cargo</option> 
            
            <option value="Mecanico">Mecánico</option>
            <option value="Administrador">Administrador</option>
            <option value="Gerente">Gerente</option>
        </select>
        </div>
    <div class="col-md-6">
        <label for="date_contratacion" class="form-label">Fecha Contratación</label>
        <input v-model="empleado.fechaContratacion" type="date" class="form-control" id="date_contratacion" required />
    </div>
</div>
          
          <div class="mb-4">
            <label for="sueldo" class="form-label">Sueldo Base ($)</label>
            <input v-model="empleado.sueldo" type="number" step="0.01" class="form-control" id="sueldo" placeholder="Ingresar Sueldo Base" required />
          </div>

          <div class="d-flex justify-content-between pt-2">
            <button type="button" class="btn btn-secondary-outline w-50 me-2" @click="cancelarEdicion">Cancelar</button>
            <button type="submit" class="btn btn-accent w-50">{{ empleadoEditandoId !== null ? 'Actualizar Empleado' : 'Registrar Empleado' }}</button>
          </div>
        </form>
      </div>
    </div>
    
    <div class="table-container mt-5">
      <div class="card employee-table-card p-4 shadow-lg">
        <div class="text-center mb-4">
          <i class="fas fa-users form-icon"></i>
          <h3 class="form-title">Lista de Empleados</h3>
          <p class="form-subtitle">Gestiona los empleados registrados en el sistema.</p>
        </div>
        
        <div v-if="empleados.length === 0" class="text-center py-4">
          <p class="text-muted">No hay empleados registrados aún.</p>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">Usuario</th>
                <th scope="col">Nombre</th>
                <th scope="col">Apellido</th>
                <th scope="col">Cargo</th>
                <th scope="col">Fecha Contratación</th>
                <th scope="col">Sueldo</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in empleados" :key="emp.id">
                <td>{{ emp.usuario }}</td>
                <td>{{ emp.nombre_emp }}</td>
                <td>{{ emp.apellido_emp }}</td>
                <td>{{ emp.cargo }}</td>
                <td>{{ emp.fecha_contratacion }}</td>
                <td>{{ emp.sueldo_base }}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-2" @click="editarEmpleado(emp)">
                    <i class="fas fa-edit"></i> Editar
                  </button>
                  <button class="btn btn-sm btn-danger" @click="eliminarEmpleado(emp.id_empleado)">
                    <i class="fas fa-trash"></i> Eliminar
                  </button>
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
.main-content {
  padding: 20px;
  min-height: 100vh;
  margin-left: 250px;
  background: linear-gradient(#ff7e5f, #feb47b); 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-container, .table-container {
  width: 100%;
  max-width: 1200px; 
  padding: 20px;
}

.employee-form-card, .employee-table-card {
  background-color: #D8D8C0; 
  border-radius: 16px; 
  border: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); 
}

.form-icon {
  font-size: 40px;
  color: #DF8615; 
  margin-bottom: 10px;
}

.form-title {
  color: #2c3e50; 
  margin-bottom: 5px;
  font-weight: 700;
}

.form-subtitle {
  color: #7A8370;
  font-size: 14px;
  margin-bottom: 0;
}

.form-label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 14px;
}

.form-control {
  border: 2px solid #7A8370;
  border-radius: 8px; 
  padding: 10px 15px;
  transition: all 0.3s ease;
  background-color: #f7f7f0; 
  color: #2c3e50;
}

.form-control:focus {
  border-color: #DF8615; 
  box-shadow: 0 0 0 0.25rem rgba(223, 134, 21, 0.25);
}

.form-control::placeholder {
  color: #A0A0A0;
  font-style: italic;
}

.form-control[type="date"] {
  appearance: none;
  padding-right: 15px;
}

.btn-accent {
  background-color: #DF8615; 
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  transition: background-color 0.3s ease;
}

.btn-accent:hover {
  background-color: #F84600; 
  color: white;
}

.btn-secondary-outline {
  background-color: transparent;
  color: #7A8370;
  border: 2px solid #7A8370;
  font-weight: bold;
  border-radius: 8px;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

.btn-secondary-outline:hover {
  background-color: #7A8370;
  color: #D8D8C0;
}

/* Estilos para la tabla */
.table {
  background-color: #f7f7f0;
  border-radius: 8px;
  overflow: hidden;
}

.table th {
  background-color: #7A8370;
  color: white;
  font-weight: 600;
  border: none;
  padding: 12px 15px;
}

.table td {
  padding: 12px 15px;
  vertical-align: middle;
  border-bottom: 1px solid #D8D8C0;
}

.table-hover tbody tr:hover {
  background-color: rgba(223, 134, 21, 0.1);
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background-color: #e0a800;
  border-color: #d39e00;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

@media (max-width: 992px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
    align-items: flex-start; 
  }
  
  .form-container, .table-container {
    padding: 0;
  }
  
  .table-responsive {
    font-size: 14px;
  }
}

.logo-fixed {
  display: none;
}
</style>