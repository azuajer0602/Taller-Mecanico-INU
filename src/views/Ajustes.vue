<template>
  <Side/>
  <div class="main-content">
    <!-- Formulario para agregar/editar repuestos -->
    <div class="form-container">
      <div class="card employee-form-card p-4 shadow-lg mb-5">
        <div class="text-center mb-4">
          <i class="bi bi-box-seam form-icon"></i>
          <h3 class="form-title">
            {{ repuestoEditandoId !== null ? 'Editar Repuesto' : 'Registrar Nuevo Repuesto' }}
          </h3>
          <p class="form-subtitle">
            {{ repuestoEditandoId !== null ? 'Modifica la información del repuesto seleccionado.' : 'Completa los datos para registrar un nuevo repuesto en el inventario.' }}
          </p>
        </div>

        <form @submit.prevent="submitForm">
          <div class="row g-3">
            <!-- ID Repuesto -->
            <div class="col-md-6">
              <label for="id_repuesto" class="form-label">
                <i class="fas fa-barcode me-1"></i> ID Repuesto
              </label>
              <input 
                type="text" 
                class="form-control" 
                id="id_repuesto"
                v-model="repuesto.id_repuesto"
                placeholder="Ej: REP-001"
                required
              >
              <div class="form-text">Identificador único del repuesto</div>
            </div>

            <!-- Nombre Repuesto -->
            <div class="col-md-6">
              <label for="nombre_repuesto" class="form-label">
                <i class="fas fa-tools me-1"></i> Nombre del Repuesto
              </label>
              <input 
                type="text" 
                class="form-control" 
                id="nombre_repuesto"
                v-model="repuesto.nombre_repuesto"
                placeholder="Ej: Filtro de Aceite"
                required
              >
            </div>

            <!-- Descripción -->
            <div class="col-12">
              <label for="desc_repuesto" class="form-label">
                <i class="fas fa-file-alt me-1"></i> Descripción
              </label>
              <textarea 
                class="form-control" 
                id="desc_repuesto"
                v-model="repuesto.desc_repuesto"
                rows="3"
                placeholder="Describe las características y especificaciones del repuesto..."
              ></textarea>
            </div>

            <!-- Precio Unitario -->
            <div class="col-md-6">
              <label for="precio_unitario" class="form-label">
                <i class="fas fa-tag me-1"></i> Precio Unitario
              </label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input 
                  type="number" 
                  class="form-control" 
                  id="precio_unitario"
                  v-model="repuesto.precio_unitario"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                >
              </div>
              <div class="form-text">Precio en dólares</div>
            </div>

            <!-- Stock en Inventario -->
            <div class="col-md-6">
              <label for="stock_inventario" class="form-label">
                <i class="fas fa-boxes me-1"></i> Stock en Inventario
              </label>
              <input 
                type="number" 
                class="form-control" 
                id="stock_inventario"
                v-model="repuesto.stock_inventario"
                placeholder="0"
                min="0"
                required
              >
              <div class="form-text">Cantidad disponible</div>
            </div>

            <!-- Botones de acción -->
            <div class="col-12 mt-4">
              <div class="d-flex justify-content-center gap-3">
                <button 
                  type="submit" 
                  class="btn btn-accent px-4 py-2"
                  :disabled="!formValido"
                >
                  <i class="fas" :class="repuestoEditandoId !== null ? 'fa-save' : 'fa-plus'"></i>
                  {{ repuestoEditandoId !== null ? 'Actualizar Repuesto' : 'Registrar Repuesto' }}
                </button>
                
                <button 
                  type="button" 
                  class="btn btn-secondary-outline px-4 py-2"
                  @click="cancelarEdicion"
                  v-if="repuestoEditandoId !== null"
                >
                  <i class="fas fa-times me-1"></i> Cancelar Edición
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabla de repuestos -->
    <div class="table-container">
      <div class="card employee-table-card p-4 shadow-lg">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <i class="bi bi-tools form-icon me-2"></i>
            <h3 class="form-title d-inline">Inventario de Repuestos</h3>
          </div>
          <div class="d-flex align-items-center">
            <span class="badge bg-orange me-3">
              <i class="fas fa-box me-1"></i>
              Total: {{ repuestos.length }} repuestos
            </span>
            <button 
              class="btn btn-sm btn-accent"
              @click="cargarRepuestos"
              :disabled="cargando"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': cargando }"></i>
              Actualizar
            </button>
          </div>
        </div>
        
        <!-- Estado de carga -->
        <div v-if="cargando" class="text-center py-5">
          <div class="spinner-border text-orange" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-3 text-muted">Cargando inventario de repuestos...</p>
        </div>
        
        <!-- Error -->
        <div v-else-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ error }}
          <button type="button" class="btn-close" @click="error = null"></button>
        </div>
        
        <!-- Sin datos -->
        <div v-else-if="repuestos.length === 0" class="text-center py-5">
          <i class="bi bi-inbox display-4 text-muted mb-3"></i>
          <p class="text-muted fs-5">No hay repuestos registrados en el inventario.</p>
          <p class="text-muted">Comienza registrando un nuevo repuesto usando el formulario superior.</p>
        </div>
        
        <!-- Tabla con datos -->
        <div v-else class="table-responsive">
          <table class="table table-hover table-striped align-middle">
            <thead class="table-orange">
              <tr>
                <th scope="col" class="text-center">
                  <i class="fas fa-barcode"></i> ID
                </th>
                <th scope="col">
                  <i class="fas fa-tools"></i> Nombre
                </th>
                <th scope="col">
                  <i class="fas fa-file-alt"></i> Descripción
                </th>
                <th scope="col" class="text-center">
                  <i class="fas fa-tag"></i> Precio
                </th>
                <th scope="col" class="text-center">
                  <i class="fas fa-boxes"></i> Stock
                </th>
                <th scope="col" class="text-center">
                  <i class="fas fa-cogs"></i> Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rep in repuestos" :key="rep.id_repuesto">
                <td class="text-center fw-bold text-orange">{{ rep.id_repuesto }}</td>
                <td>
                  <strong>{{ rep.nombre_repuesto }}</strong>
                </td>
                <td>
                  <small class="text-muted">{{ rep.desc_repuesto || 'Sin descripción' }}</small>
                </td>
                <td class="text-center">
                  <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2">
                    ${{ parseFloat(rep.precio_unitario).toFixed(2) }}
                  </span>
                </td>
                <td class="text-center">
                  <span 
                    class="badge px-3 py-2"
                    :class="{
                      'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25': rep.stock_inventario <= 5,
                      'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25': rep.stock_inventario > 5 && rep.stock_inventario <= 15,
                      'bg-success bg-opacity-10 text-success border border-success border-opacity-25': rep.stock_inventario > 15
                    }"
                  >
                    {{ rep.stock_inventario }} unidades
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm" role="group">
                    <button 
                      class="btn btn-outline-warning"
                      @click="editarRepuesto(rep)"
                      title="Editar repuesto"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger"
                      @click="eliminarRepuesto(rep.id_repuesto)"
                      title="Eliminar repuesto"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Resumen del inventario -->
          <div class="row mt-4">
            <div class="col-md-4">
              <div class="card bg-light border-0">
                <div class="card-body text-center">
                  <h6 class="text-muted">Valor Total Inventario</h6>
                  <h4 class="text-success">
                    ${{ calcularValorTotal().toFixed(2) }}
                  </h4>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-light border-0">
                <div class="card-body text-center">
                  <h6 class="text-muted">Stock Bajo (≤5)</h6>
                  <h4 class="text-danger">
                    {{ contarStockBajo() }}
                  </h4>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-light border-0">
                <div class="card-body text-center">
                  <h6 class="text-muted">Repuestos Registrados</h6>
                  <h4 class="text-orange">
                    {{ repuestos.length }}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Side from '../components/SidebarComponent.vue';
import { reactive, ref, onMounted, computed } from 'vue';
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

// Computed para validar el formulario
const formValido = computed(() => {
  return repuesto.id_repuesto.trim() !== '' &&
         repuesto.nombre_repuesto.trim() !== '' &&
         repuesto.precio_unitario !== '' &&
         repuesto.stock_inventario !== '';
});

// Función para cargar repuestos
const cargarRepuestos = async () => {
  cargando.value = true;
  error.value = null;
  try {
    console.log('Cargando Repuestos desde:', `${API_BASE_URL}/obtenerRep`);
    const response = await axios.get(`${API_BASE_URL}/obtenerRep`);
    
    // Asegurarse de que tenemos un array
    repuestos.value = response.data.repuestos || response.data || [];
    console.log("Repuestos cargados:", repuestos.value.length);
    
  } catch (err) {
    console.error('❌ Error al cargar los repuestos:', err);
    error.value = `Error ${err.response?.status || 'de conexión'}: ${err.response?.data?.message || err.message}`;
  } finally {
    cargando.value = false;
  }
};

// Función para enviar formulario
const submitForm = async () => {
  try {
    const datosParaEnviar = {
      id_repuesto: repuesto.id_repuesto,
      nombre_repuesto: repuesto.nombre_repuesto,
      desc_repuesto: repuesto.desc_repuesto,
      precio_unitario: parseFloat(repuesto.precio_unitario),
      stock_inventario: parseInt(repuesto.stock_inventario)
    };

    if (repuestoEditandoId.value !== null) {
      // Actualizar repuesto existente
      await axios.put(`${API_BASE_URL}/updateRep`, datosParaEnviar);
    } else {
      // Registrar nuevo repuesto
      await axios.post(`${API_BASE_URL}/registerRep`, datosParaEnviar);
    }
    
    await cargarRepuestos();
    cancelarEdicion();
    alert(repuestoEditandoId.value !== null ? '✅ Repuesto actualizado correctamente' : '✅ Repuesto registrado correctamente');
    
  } catch (err) {
    console.error('❌ Error al guardar repuesto:', err);
    alert('❌ Error: ' + (err.response?.data?.message || err.message));
  }
}

// Función para editar repuesto
const editarRepuesto = (repuestoParaEditar) => {
  Object.assign(repuesto, {
    id_repuesto: repuestoParaEditar.id_repuesto,
    nombre_repuesto: repuestoParaEditar.nombre_repuesto,
    desc_repuesto: repuestoParaEditar.desc_repuesto || "",
    precio_unitario: repuestoParaEditar.precio_unitario,
    stock_inventario: repuestoParaEditar.stock_inventario
  });
  
  repuestoEditandoId.value = repuestoParaEditar.id_repuesto;
  document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
}

// Función para eliminar repuesto
const eliminarRepuesto = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este repuesto? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    console.log("Eliminando Repuesto ID:", id);
    await axios.delete(`${API_BASE_URL}/deleteRep`, {
      data: { id_repuesto: id }
    });
    
    await cargarRepuestos();
    alert('✅ Repuesto eliminado correctamente');
  } catch (err) {
    console.error('❌ Error al eliminar repuesto:', err);
    alert('❌ Error: ' + (err.response?.data?.message || err.message));
  }
};

// Función para cancelar edición
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

// Funciones para cálculos del inventario
const calcularValorTotal = () => {
  return repuestos.value.reduce((total, rep) => {
    const precio = parseFloat(rep.precio_unitario) || 0;
    const stock = parseInt(rep.stock_inventario) || 0;
    return total + (precio * stock);
  }, 0);
};

const contarStockBajo = () => {
  return repuestos.value.filter(rep => {
    const stock = parseInt(rep.stock_inventario) || 0;
    return stock <= 5;
  }).length;
};

// Cargar datos al montar el componente
onMounted(() => {
  cargarRepuestos();
});
</script>

<style scoped>
.main-content {
  padding: 30px;
  min-height: 100vh;
  margin-left: 250px;
  background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-container, .table-container {
  width: 100%;
  max-width: 1300px;
  padding: 20px;
}

.employee-form-card, .employee-table-card {
  background-color: #F8F9FA;
  border-radius: 20px;
  border: 1px solid rgba(223, 134, 21, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.employee-form-card:hover, .employee-table-card:hover {
  transform: translateY(-5px);
}

.form-icon {
  font-size: 45px;
  color: #DF8615;
  margin-bottom: 10px;
}

.form-title {
  color: #2c3e50;
  margin-bottom: 5px;
  font-weight: 700;
  font-size: 1.8rem;
}

.form-subtitle {
  color: #7A8370;
  font-size: 15px;
  margin-bottom: 0;
}

.form-label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.form-control {
  border: 2px solid #DEE2E6;
  border-radius: 10px;
  padding: 12px 15px;
  transition: all 0.3s ease;
  background-color: white;
  color: #2c3e50;
  font-size: 15px;
}

.form-control:focus {
  border-color: #DF8615;
  box-shadow: 0 0 0 0.3rem rgba(223, 134, 21, 0.15);
}

.form-control::placeholder {
  color: #A0A0A0;
  font-style: italic;
}

.btn-accent {
  background: linear-gradient(135deg, #DF8615 0%, #F84600 100%);
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  padding: 12px 25px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(223, 134, 21, 0.3);
}

.btn-accent:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(223, 134, 21, 0.4);
  color: white;
}

.btn-accent:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary-outline {
  background-color: transparent;
  color: #7A8370;
  border: 2px solid #7A8370;
  font-weight: bold;
  border-radius: 10px;
  padding: 12px 25px;
  transition: all 0.3s ease;
}

.btn-secondary-outline:hover {
  background-color: #7A8370;
  color: white;
  transform: translateY(-2px);
}

/* Estilos para la tabla */
.table {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.table-orange {
  background: linear-gradient(135deg, #DF8615 0%, #F84600 100%);
}

.table-orange th {
  color: white;
  font-weight: 600;
  border: none;
  padding: 15px 20px;
  text-align: center;
  vertical-align: middle;
}

.table td {
  padding: 15px 20px;
  vertical-align: middle;
  border-bottom: 1px solid #F0F0F0;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(223, 134, 21, 0.05);
}

.table-hover tbody tr:hover {
  background-color: rgba(223, 134, 21, 0.1);
  transform: scale(1.01);
  transition: all 0.2s ease;
}

.btn-group-sm .btn {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 8px;
}

.btn-outline-warning {
  color: #DF8615;
  border-color: #DF8615;
}

.btn-outline-warning:hover {
  background-color: #DF8615;
  border-color: #DF8615;
  color: white;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

/* Badges personalizados */
.badge.bg-orange {
  background: linear-gradient(135deg, #DF8615 0%, #F84600 100%) !important;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 600;
}

/* Colores personalizados */
.text-orange {
  color: #DF8615 !important;
}

.bg-orange {
  background-color: #DF8615 !important;
}

/* Responsive */
@media (max-width: 992px) {
  .main-content {
    margin-left: 0;
    padding: 20px;
    align-items: stretch;
  }
  
  .form-container, .table-container {
    padding: 10px;
    max-width: 100%;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .table-responsive {
    font-size: 14px;
    margin: 0 -10px;
  }
  
  .table th, .table td {
    padding: 10px 12px;
  }
  
  .btn-group {
    flex-direction: column;
    gap: 5px;
  }
}

@media (max-width: 768px) {
  .d-flex.justify-content-between.align-items-center.mb-4 {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .row.mt-4 .col-md-4 {
    margin-bottom: 15px;
  }
}
</style>