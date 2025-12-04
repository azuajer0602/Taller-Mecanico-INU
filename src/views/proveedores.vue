<script setup>
import Side from '../components/SidebarComponent.vue';
import { reactive, ref, onMounted } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/proveedores';

const proveedor = reactive({
  id_proveedor: "",
  nombre_fiscal: "",
  rif_juridico: "",
  telefono_proveedor: "",
  direccion_proveedor: ""
})

const proveedores = ref([]);
const cargando = ref(false);
const error = ref(null);
const proveedorEditandoId = ref(null);

const cargarProveedores = async () => {
  cargando.value = true;
  error.value = null;
  try {
    console.log('Cargando proveedores desde:', `${API_BASE_URL}/obtenerPro`);
    const response = await axios.get(`${API_BASE_URL}/obtenerPro`);
    

    proveedores.value = response.data.proveedores || response.data;
    console.log(" Proveedores cargados:", proveedores.value);
    
  } catch (err) {
    console.error(' Error al cargar los proveedores:', err);
    error.value = `Error: ${err.response?.status || 'Conexión'} - ${err.response?.data?.message || err.message}`;
  } finally {
    cargando.value = false;
  }
};

const submitForm = async () => {
  try {
    const datosParaEnviar = {
      id_proveedor: proveedor.id_proveedor,
      nombre_fiscal: proveedor.nombre_fiscal,
      rif_juridico: proveedor.rif_juridico,
      telefono_proveedor: proveedor.telefono_proveedor,
      direccion_proveedor: proveedor.direccion_proveedor
    };

    if (proveedorEditandoId.value !== null) {
      
      await axios.put(`${API_BASE_URL}/updatePro`, datosParaEnviar);
    } else {
      
      await axios.post(`${API_BASE_URL}/registerPro`, datosParaEnviar);
    }
    
    await cargarProveedores();
    cancelarEdicion();
    alert(proveedorEditandoId.value !== null ? 'Proveedor actualizado' : 'Proveedor registrado');
    
  } catch (err) {
    console.error('❌ Error al guardar proveedor:', err);
    alert('Error: ' + (err.response?.data?.message || err.message));
  }
}

const editarProveedor = (proveedorParaEditar) => {
  Object.assign(proveedor, {
    id_proveedor: proveedorParaEditar.id_proveedor,
    nombre_fiscal: proveedorParaEditar.nombre_fiscal,
    rif_juridico: proveedorParaEditar.rif_juridico,
    telefono_proveedor: proveedorParaEditar.telefono_proveedor,
    direccion_proveedor: proveedorParaEditar.direccion_proveedor
  });
  
  proveedorEditandoId.value = proveedorParaEditar.id_proveedor;
  document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
}

const eliminarProveedor = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este Proveedor?')) {
    return;
  }

  try {
    console.log("Eliminando proveedor ID:", id);
    await axios.delete(`${API_BASE_URL}/deletePro`, {
      data: { id_proveedor: id }
    });
    
    await cargarProveedores();
    alert('Proveedor eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar Proveedor:', error);
    alert('Error: ' + (error.response?.data?.message || error.message));
  }
};

const cancelarEdicion = () => {
  Object.assign(proveedor, {
    id_proveedor: "",
    nombre_fiscal: "",
    rif_juridico: "",
    telefono_proveedor: "",
    direccion_proveedor: ""
  });
  proveedorEditandoId.value = null;
}

onMounted(() => {
  cargarProveedores();
});
</script>

<template>
  <Side/>
  <div class="main-content">
   
    <div class="form-container">
      <div class="card employee-form-card p-4 shadow-lg">
        <div class="text-center mb-4">
          <i class="fas fa-id-badge form-icon"></i>
          <h3 class="form-title">{{ proveedorEditandoId !== null ? 'Editar Proveedor' : 'Registro de Proveedor' }}</h3>
          <p class="form-subtitle">{{ proveedorEditandoId !== null ? 'Modifica los datos del proveedor seleccionado.' : 'Ingresa los datos del nuevo proveedor para el sistema.' }}</p>
        </div>
        
        <form @submit.prevent="submitForm">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="id_provedor" class="form-label">ID Proveedor</label>
              <input v-model="proveedor.id_proveedor" type="text" class="form-control" id="id_provedor" placeholder="Ej: PROV001" required />
            </div>
            <div class="col-md-6">
              <label for="rif_juridico" class="form-label">RIF Jurídico</label>
              <input v-model="proveedor.rif_juridico" type="text" class="form-control" id="rif_juridico" placeholder="Ej: J-12345678-9" required />
            </div>
          </div>

          <div class="mb-3">
            <label for="nombre_fiscal" class="form-label">Nombre Fiscal</label>
            <input v-model="proveedor.nombre_fiscal" type="text" class="form-control" id="nombre_fiscal" placeholder="Nombre completo de la empresa" required />
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="telefono_proveedor" class="form-label">Teléfono</label>
              <input v-model="proveedor.telefono_proveedor" type="text" class="form-control" id="telefono_proveedor" placeholder="Ej: 0412-1234567" required />
            </div>
            <div class="col-md-6">
              <label for="direccion_proveedor" class="form-label">Dirección</label>
              <input v-model="proveedor.direccion_proveedor" type="text" class="form-control" id="direccion_proveedor" placeholder="Dirección completa" required />
            </div>
          </div>
        
          <div class="d-flex justify-content-between pt-2">
            <button type="button" class="btn btn-secondary-outline w-50 me-2" @click="cancelarEdicion">Cancelar</button>
            <button type="submit" class="btn btn-accent w-50">{{ proveedorEditandoId !== null ? 'Actualizar Proveedor' : 'Registrar Proveedor' }}</button>
          </div>
        </form>
      </div>
    </div>
    

    <div class="table-container mt-5">
      <div class="card employee-table-card p-4 shadow-lg">
        <div class="text-center mb-4">
          <i class="fas fa-truck form-icon"></i>
          <h3 class="form-title">Lista de Proveedores</h3>
          <p class="form-subtitle">Gestiona los proveedores registrados en el sistema.</p>
        </div>
        
      
        <div v-if="cargando" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando proveedores...</p>
        </div>
      
        <div v-else-if="error" class="alert alert-danger text-center">
          {{ error }}
        </div>
        
       
        <div v-else-if="proveedores.length === 0" class="text-center py-4">
          <p class="text-muted">No hay proveedores registrados aún.</p>
        </div>
        
        <!-- Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">ID Proveedor</th>
                <th scope="col">Nombre Fiscal</th>
                <th scope="col">RIF</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Dirección</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prov in proveedores" :key="prov.id_provedor">
                <td>{{ prov.id_proveedor }}</td>
                <td>{{ prov.nombre_fiscal }}</td>
                <td>{{ prov.rif_juridico }}</td>
                <td>{{ prov.telefono_proveedor }}</td>
                <td>{{ prov.direccion_proveedor }}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-2" @click="editarProveedor(prov)">
                    <i class="fas fa-edit"></i> Editar
                  </button>
                  <button class="btn btn-sm btn-danger" @click="eliminarProveedor(prov.id_provedor)">
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