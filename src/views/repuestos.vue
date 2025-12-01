<template>
  <Side />
  <div class="main-content">
    <div class="container mt-4">
      <!-- Modal para agregar/editar repuesto -->
      <div class="modal fade" id="repuestoModal" tabindex="-1" aria-labelledby="repuestoModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title" id="repuestoModalLabel">
                <i class="bi bi-plus-circle me-2"></i>{{ esEdicion ? 'Editar' : 'Agregar' }} Repuesto
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarRepuesto">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="nombre" class="form-label">Nombre:</label>
                    <input 
                      id="nombre" 
                      v-model="repuestoActual.nombre" 
                      type="text" 
                      class="form-control" 
                      required 
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="precio" class="form-label">Precio Unitario:</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input 
                        id="precio" 
                        v-model.number="repuestoActual.precio_unitario" 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        class="form-control" 
                        required 
                      />
                    </div>
                  </div>
                  <div class="col-12 mb-3">
                    <label for="descripcion" class="form-label">Descripción:</label>
                    <textarea 
                      id="descripcion" 
                      v-model="repuestoActual.descripcion" 
                      class="form-control" 
                      rows="3"
                    ></textarea>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="stock" class="form-label">Stock en Inventario:</label>
                    <input 
                      id="stock" 
                      v-model.number="repuestoActual.stock" 
                      type="number" 
                      min="0" 
                      class="form-control" 
                      required 
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="proveedor" class="form-label">Proveedor:</label>
                    <select 
                      id="proveedor" 
                      v-model="repuestoActual.id_proveedor" 
                      class="form-select"
                      required
                    >
                      <option value="">Seleccionar proveedor</option>
                      <option v-for="proveedor in proveedores" :key="proveedor.id_proveedor" :value="proveedor.id_proveedor">
                        {{ proveedor.nombre }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">
                    <i class="bi bi-save-fill me-1"></i>{{ esEdicion ? 'Actualizar' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación para eliminar -->
      <div class="modal fade" id="confirmarEliminarModal" tabindex="-1" aria-labelledby="confirmarEliminarModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title" id="confirmarEliminarModalLabel">
                <i class="bi bi-exclamation-triangle me-2"></i>Confirmar Eliminación
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ¿Está seguro de que desea eliminar el repuesto "<strong>{{ repuestoActual.nombre }}</strong>"?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger" @click="eliminarRepuestoConfirmado">
                <i class="bi bi-trash-fill me-1"></i>Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h1 class="mb-0 h3">
            <i class="bi bi-gear-fill me-2"></i>Gestión de Repuestos
          </h1>
          <button 
            type="button" 
            class="btn btn-light" 
            data-bs-toggle="modal" 
            data-bs-target="#repuestoModal"
            @click="abrirModalAgregar"
          >
            <i class="bi bi-plus-lg me-1"></i>Comprar Repuesto
          </button>
        </div>

        <div class="card-body">
          <!-- Búsqueda -->
          <div class="row mb-4">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Buscar por nombre o descripción..." 
                  v-model="filtroBusqueda"
                />
              </div>
            </div>
          </div>

          <!-- Tabla de repuestos -->
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-dark">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Descripción</th>
                  <th scope="col">Precio Unitario</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Proveedor</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="repuesto in repuestosFiltrados" :key="repuesto.id_repues">
                  <th scope="row">{{ repuesto.id_repues }}</th>
                  <td>{{ repuesto.nombre }}</td>
                  <td>{{ repuesto.descripcion }}</td>
                  <td>$ {{ repuesto.precio_unitario.toFixed(2) }}</td>
                  <td>
                    <span 
                      class="badge" 
                      :class="{
                        'bg-danger': repuesto.stock === 0,
                        'bg-warning text-dark': repuesto.stock > 0 && repuesto.stock <= 5,
                        'bg-success': repuesto.stock > 5
                      }"
                    >
                      {{ repuesto.stock }}
                    </span>
                  </td>
                  <td>{{ obtenerNombreProveedor(repuesto.id_proveedor) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button 
                        type="button" 
                        class="btn btn-outline-primary"
                        data-bs-toggle="modal" 
                        data-bs-target="#repuestoModal"
                        @click="editarRepuesto(repuesto)"
                      >
                        <i class="bi bi-pencil-fill"></i>
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-outline-danger"
                        data-bs-toggle="modal" 
                        data-bs-target="#confirmarEliminarModal"
                        @click="prepararEliminar(repuesto)"
                      >
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mensaje cuando no hay resultados -->
          <div v-if="repuestosFiltrados.length === 0" class="text-center py-4">
            <i class="bi bi-inbox display-1 text-muted"></i>
            <p class="mt-3 text-muted">No se encontraron repuestos que coincidan con los criterios de búsqueda.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, computed, onMounted } from "vue";
import { Modal } from 'bootstrap';

const API_BASE = 'http://localhost:3000/api';

// Estado de la aplicación
const repuestos = ref([]);
const proveedores = ref([]);
const repuestoActual = ref({
  id_repues: null,
  nombre: '',
  descripcion: '',
  precio_unitario: 0,
  stock: 0,
  id_proveedor: ''
});
const esEdicion = ref(false);

// Filtros
const filtroBusqueda = ref('');

// Cargar repuestos y proveedores al montar el componente
const cargarRepuestos = async () => {
  try {
    const response = await fetch(`${API_BASE}/repuestos`);
    const data = await response.json();
    
    if (data.success) {
      repuestos.value = data.data;
    } else {
      throw new Error(data.message || 'Error al cargar repuestos');
    }
  } catch (error) {
    console.error("Error cargando repuestos:", error);
    alert("No se pudieron cargar los repuestos. Revise la conexión con el servidor.");
  }
};

const cargarProveedores = async () => {
  try {
    const response = await fetch(`${API_BASE}/proveedores`);
    const data = await response.json();
    
    if (data.success) {
      proveedores.value = data.data;
    } else {
      throw new Error(data.message || 'Error al cargar proveedores');
    }
  } catch (error) {
    console.error("Error cargando proveedores:", error);
    alert("No se pudieron cargar los proveedores. Revise la conexión con el servidor.");
  }
};

// Obtener nombre del proveedor por ID
const obtenerNombreProveedor = (idProveedor) => {
  const proveedor = proveedores.value.find(p => p.id_proveedor === idProveedor);
  return proveedor ? proveedor.nombre : 'Proveedor no encontrado';
};

// Filtrar repuestos
const repuestosFiltrados = computed(() => {
  if (!filtroBusqueda.value) {
    return repuestos.value;
  }
  
  const busqueda = filtroBusqueda.value.toLowerCase();
  return repuestos.value.filter(repuesto => 
    repuesto.nombre.toLowerCase().includes(busqueda) || 
    repuesto.descripcion.toLowerCase().includes(busqueda)
  );
});

// Funciones para el modal
const abrirModalAgregar = () => {
  esEdicion.value = false;
  repuestoActual.value = {
    id_repues: null,
    nombre: '',
    descripcion: '',
    precio_unitario: 0,
    stock: 0,
    id_proveedor: ''
  };
};

const editarRepuesto = (repuesto) => {
  esEdicion.value = true;
  repuestoActual.value = { ...repuesto };
};

const prepararEliminar = (repuesto) => {
  repuestoActual.value = { ...repuesto };
};

// Operaciones CRUD
const guardarRepuesto = async () => {
  try {
    const url = esEdicion.value 
      ? `${API_BASE}/repuestos/${repuestoActual.value.id_repues}`
      : `${API_BASE}/repuestos`;
    
    const method = esEdicion.value ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(repuestoActual.value)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Cerrar modal
      const modal = Modal.getInstance(document.getElementById('repuestoModal'));
      modal.hide();
      
      // Recargar datos
      await cargarRepuestos();
      
      alert(`Repuesto ${esEdicion.value ? 'actualizado' : 'agregado'} correctamente.`);
    } else {
      throw new Error(data.message || 'Error al guardar repuesto');
    }
  } catch (error) {
    console.error("Error guardando repuesto:", error);
    alert(`Error al ${esEdicion.value ? 'actualizar' : 'agregar'} repuesto: ${error.message}`);
  }
};

const eliminarRepuestoConfirmado = async () => {
  try {
    const response = await fetch(`${API_BASE}/repuestos/${repuestoActual.value.id_repues}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Cerrar modal
      const modal = Modal.getInstance(document.getElementById('confirmarEliminarModal'));
      modal.hide();
      
      // Recargar datos
      await cargarRepuestos();
      
      alert('Repuesto eliminado correctamente.');
    } else {
      throw new Error(data.message || 'Error al eliminar repuesto');
    }
  } catch (error) {
    console.error("Error eliminando repuesto:", error);
    alert(`Error al eliminar repuesto: ${error.message}`);
  }
};

// Inicialización
onMounted(() => {
  cargarRepuestos();
  cargarProveedores();
});
</script>

<style scoped>
.main-content {
  padding: 20px;
  min-height: 100vh;
  margin-left: 280px;
  background-color: #f8f9fa;
}

.table th {
  border-top: none;
}

.card {
  margin-bottom: 1rem;
}

@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
  }
  
  .btn-group {
    display: flex;
    flex-direction: column;
  }
  
  .btn-group .btn {
    margin-bottom: 0.25rem;
  }
}
</style>