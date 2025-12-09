<script setup>
import Side from '../components/SidebarComponent.vue';
import { reactive, ref, onMounted } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/repuestos';

const repuesto = reactive({
  id_repuesto: "",
  nombre_repuesto: "",
  desc_repuesto: "",
  precio_unitario: "",
  stock_inventario: ""
})

const repuestos = ref([]);
const cargando = ref(false);
const error = ref(null);
const repuestoEditandoId = ref(null);

const cargarRepuestos = async () => {
  cargando.value = true;
  error.value = null;
  try {
    console.log('Cargando Repuestos desde:', `${API_BASE_URL}/obtenerRep`);
    const response = await axios.get(`${API_BASE_URL}/obtenerRep`);
    

    repuestos.value = response.data.repuestos || response.data;
    console.log(" Proveedores cargados:", repuestos.value);
    
  } catch (err) {
    console.error(' Error al cargar los repuestos:', err);
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
      precio_unitario: repuesto.precio_unitario,
      stock_inventario: repuesto.stock_inventario
    };

    if (repuestoEditandoId.value !== null) {
      
      await axios.put(`${API_BASE_URL}/updateRep`, datosParaEnviar);
    } else {
      
      await axios.post(`${API_BASE_URL}/registerRep`, datosParaEnviar);
    }
    
    await cargarRepuestos();
    cancelarEdicion();
    alert(repuestoEditandoId.value !== null ? 'Repuestos actualizado' : 'Repuestos registrado');
    
  } catch (err) {
    console.error('❌ Error al guardar Repuestos:', err);
    alert('Error: ' + (err.response?.data?.message || err.message));
  }
}

const editarRepuesto = (repuestoParaEditar) => {
  Object.assign(repuesto, {
    id_repuesto: repuestoParaEditar.id_repuesto,
    nombre_repuesto: repuestoParaEditar.nombre_repuesto,
    desc_repuesto: repuestoParaEditar.desc_repuesto,
    precio_unitario: repuestoParaEditar.precio_unitario,
    stock_inventario: repuestoParaEditar.stock_inventario
  });
  
  repuestoEditandoId.value = repuestoParaEditar.id_repuesto;
  document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
}

const eliminarRepuesto = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este Repuesto?')) {
    return;
  }

  try {
    console.log("Eliminando Repuesto ID:", id);
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
}

onMounted(() => {
  cargarRepuestos();
});
</script>


<template>
  <Side/>
  <div class="main-content">
    <div class="form-container">
      <div class="card employee-form-card p-4 shadow-lg">
        <div class="text-center mb-4">
          <i class="fas fa-id-badge form-icon"></i>
          <h3 class="form-title">{{ repuestoEditandoId !== null ? 'Editar Repuesto' : 'Registro y Edicion de Repuestos' }}</h3>
          <p class="form-subtitle">{{ repuestoEditandoId !== null ? 'Modifica los datos del proveedor seleccionado.' : 'Ingresa los datos del nuevo proveedor para el sistema.' }}</p>
        </div>
        
        <form @submit.prevent="submitForm">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="id_repuesto" class="form-label">ID Repuesto</label>
              <input v-model="repuesto.id_repuesto" type="text" class="form-control" id="id_provedor" placeholder="Ej: 03" required />
            </div>
            <div class="col-md-6">
              <label for="nombre_repuesto" class="form-label">Nombre repuesto</label>
              <input v-model="repuesto.nombre_repuesto" type="text" class="form-control" id="rif_juridico" placeholder="Ej: Amortiguador" required />
            </div>
          </div>

          <div class="mb-3">
            <label for="desc_repuesto" class="form-label">Descripcion</label>
            <input v-model="repuesto.desc_repuesto" type="text" class="form-control" id="nombre_fiscal" placeholder="Algunos detalles del repuesto" required />
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="precio_unitario" class="form-label">precio</label>
              <input v-model="repuesto.precio_unitario" type="text" class="form-control" id="telefono_proveedor" placeholder="Ej: 20.00" required />
            </div>
            <div class="col-md-6">
              <label for="stock_inventario" class="form-label">Stock</label>
              <input v-model="repuesto.stock_inventario" type="text" class="form-control" id="direccion_proveedor" placeholder="Aqui se deja en 0" required />
            </div>
          </div>
        
          <div class="d-flex justify-content-between pt-2">
            <button type="button" class="btn btn-secondary-outline w-50 me-2" @click="cancelarEdicion">Cancelar</button>
            <button type="submit" class="btn btn-accent w-50">{{ repuestoEditandoId !== null ? 'Actualizar Repuesto' : 'Registrar Repuesto' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div class="table-container mt-5">
      <div class="card employee-table-card p-4 shadow-lg">
        <div class="text-center mb-4">
          <i class="bi bi-tools form-icon"></i>
          <h3 class="form-title">Inventario Disponible</h3>
          <p class="form-subtitle">Gestiona los Repuestos disponibles registrados en el sistema.</p>
        </div>
        
      
        <div v-if="cargando" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando Repuestos...</p>
        </div>
      
        <div v-else-if="error" class="alert alert-danger text-center">
          {{ error }}
        </div>
        
       
        <div v-else-if="repuestos.length === 0" class="text-center py-4">
          <p class="text-muted">No hay Repuestos registrados aún.</p>
        </div>
        
        <!-- Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">ID Repuesto</th>
                <th scope="col">Nombre Repuesto</th>
                <th scope="col">Descripcion</th>
                <th scope="col">Precio</th>
                <th scope="col">Cantidad Disp</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rep in repuestos" :key="rep.id_repuesto">
                <td>{{ rep.id_repuesto }}</td>
                <td>{{ rep.nombre_repuesto }}</td>
                <td>{{ rep.desc_repuesto }}</td>
                <td>{{ rep.precio_unitario }}</td>
                <td>{{ rep.stock_inventario }}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-2" @click="editarRepuesto(rep)">
                    <i class="fas fa-edit"></i> Editar
                  </button>
                  <button class="btn btn-sm btn-danger" @click="eliminarRepuesto(rep.id_repuesto)">
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