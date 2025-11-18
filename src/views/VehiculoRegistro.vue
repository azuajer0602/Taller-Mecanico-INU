<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, reactive, computed, onMounted } from 'vue';

const API_BASE = 'http://localhost:3000/api';

// Estado reactivo
const vehiculo = reactive({
  placa: '',
  marca: '',
  modelo: '',
  año: new Date().getFullYear(),
  color: '',
  cliente: ''
});

const vehiculos = ref([]);
const mostrarFormulario = ref(true);
const vistaGrid = ref(true);
const filtroMarca = ref('');
const filtroPlaca = ref('');
const loading = ref(false);
const mensaje = ref('');
const mensajeTipo = ref('alert-success');
const mensajeIcono = ref('fa-check');
const errorPlaca = ref('');
const errorMarca = ref('');
const errorColor = ref('');
const errorCliente = ref('');
const vehiculoEditId = ref(null);

// Computed properties
const formValido = computed(() => {
  return vehiculo.placa && 
         vehiculo.placa.length >= 3 &&
         vehiculo.marca && 
         vehiculo.modelo && 
         vehiculo.año;
});

const marcasUnicas = computed(() => {
  return [...new Set(vehiculos.value.map(v => v.marca))].sort();
});

const vehiculosFiltrados = computed(() => {
  let filtrados = vehiculos.value;
  
  if (filtroMarca.value) {
    filtrados = filtrados.filter(v => 
      v.marca.toLowerCase().includes(filtroMarca.value.toLowerCase())
    );
  }
  
  if (filtroPlaca.value) {
    filtrados = filtrados.filter(v => 
      v.placa.toLowerCase().includes(filtroPlaca.value.toLowerCase())
    );
  }
  
  return filtrados;
});

const vehiculoEditando = computed(() => {
  return vehiculoEditId.value !== null;
});

// Métodos
const validarPlaca = (placa) => {
  const regex = /^[A-Z0-9]+$/i;
  if (!regex.test(placa)) {
    return 'La placa solo puede contener letras y números (sin espacios ni caracteres especiales)';
  }
  if (placa.length < 3) {
    return 'La placa debe tener al menos 3 caracteres';
  }
  return '';
};

const validarTexto = (texto) => {
  if (!texto) return '';
  const regex = /^[A-ZÁÉÍÓÚÑ\s]+$/i;
  if (!regex.test(texto)) {
    return 'Este campo solo puede contener letras y espacios';
  }
  return '';
};

const validarPlacaEnTiempoReal = () => {
  vehiculo.placa = vehiculo.placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  errorPlaca.value = '';
};

const validarPlacaFinal = () => {
  errorPlaca.value = validarPlaca(vehiculo.placa);
};

const filtrarSoloLetras = (campo) => {
  vehiculo[campo] = vehiculo[campo].replace(/[^A-ZÁÉÍÓÚÑ\s]/gi, '');
};

const validarMarca = () => {
  const error = validarTexto(vehiculo.marca);
  if (error) {
    errorMarca.value = error;
  } else {
    errorMarca.value = '';
  }
};

const cargarVehiculos = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${API_BASE}/vehiculos`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      vehiculos.value = data.data;
      console.log(`✅ Cargados ${vehiculos.value.length} vehículos`);
    } else {
      throw new Error(data.message || 'Error en la respuesta del servidor');
    }
  } catch (error) {
    console.error('Error cargando vehículos:', error);
    mostrarMensaje(
      'Error al cargar vehículos: ' + error.message, 
      'alert-danger', 
      'fa-exclamation-triangle'
    );
  } finally {
    loading.value = false;
  }
};

const guardarVehiculo = async () => {
  // Validaciones en frontend antes de enviar
  const errores = [];
  
  errorPlaca.value = validarPlaca(vehiculo.placa);
  if (errorPlaca.value) errores.push(errorPlaca.value);
  
  const errorMarcaValidacion = validarTexto(vehiculo.marca);
  if (errorMarcaValidacion) {
    errorMarca.value = errorMarcaValidacion;
    errores.push(errorMarcaValidacion);
  }
  
  const errorColorValidacion = validarTexto(vehiculo.color);
  if (errorColorValidacion) {
    errorColor.value = errorColorValidacion;
    errores.push(errorColorValidacion);
  }
  
  const errorClienteValidacion = validarTexto(vehiculo.cliente);
  if (errorClienteValidacion) {
    errorCliente.value = errorClienteValidacion;
    errores.push(errorClienteValidacion);
  }

  if (errores.length > 0) {
    mostrarMensaje(
      'Por favor corrija los errores en el formulario', 
      'alert-danger', 
      'fa-exclamation-triangle'
    );
    return;
  }

  if (!formValido.value) {
    mostrarMensaje(
      'Por favor complete todos los campos requeridos (Placa, Marca, Modelo, Año)', 
      'alert-warning', 
      'fa-exclamation-circle'
    );
    return;
  }

  loading.value = true;

  try {
    // Preparar datos para el backend
    const datosParaBackend = {
      matricula: vehiculo.placa.toUpperCase().trim(),
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      afio: parseInt(vehiculo.año),
      color: vehiculo.color || '',
      id_cliente: null
    };

    let url, method;
    
    if (vehiculoEditando.value) {
      method = 'PUT';
      url = `${API_BASE}/vehiculos/${vehiculoEditId.value}`;
    } else {
      method = 'POST';
      url = `${API_BASE}/vehiculos`;
    }

    const response = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(datosParaBackend)
    });

    const data = await response.json();
    
    if (data.success) {
      const mensajeTexto = vehiculoEditando.value ? 
        'Vehículo actualizado exitosamente' : 
        'Vehículo registrado exitosamente';
      
      mostrarMensaje(mensajeTexto, 'alert-success', 'fa-check');
      await cargarVehiculos();
      limpiarFormulario();
    } else {
      if (data.message.includes('matrícula') || data.message.includes('duplicada')) {
        errorPlaca.value = 'Esta placa ya está registrada en el sistema';
      } else {
        mostrarMensaje('Error: ' + data.message, 'alert-danger', 'fa-exclamation-triangle');
      }
    }
  } catch (error) {
    console.error('Error guardando vehículo:', error);
    mostrarMensaje(
      'Error de conexión al guardar vehículo', 
      'alert-danger', 
      'fa-exclamation-triangle'
    );
  } finally {
    loading.value = false;
  }
};

const editarVehiculo = (vehiculoEdit) => {
  Object.assign(vehiculo, {
    placa: vehiculoEdit.placa,
    marca: vehiculoEdit.marca,
    modelo: vehiculoEdit.modelo,
    año: vehiculoEdit.año,
    color: vehiculoEdit.color || '',
    cliente: vehiculoEdit.cliente || ''
  });
  vehiculoEditId.value = vehiculoEdit.id;
  mostrarFormulario.value = true;
  mensaje.value = '';
  
  // Scroll suave al formulario
  setTimeout(() => {
    const formulario = document.querySelector('.card');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

const eliminarVehiculo = async (id) => {
  if (!confirm('¿Está seguro de eliminar este vehículo? Esta acción no se puede deshacer.')) {
    return;
  }

  loading.value = true;
  try {
    const response = await fetch(`${API_BASE}/vehiculos/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      mostrarMensaje('Vehículo eliminado exitosamente', 'alert-success', 'fa-check');
      await cargarVehiculos();
    } else {
      mostrarMensaje('Error: ' + data.message, 'alert-danger', 'fa-exclamation-triangle');
    }
  } catch (error) {
    console.error('Error eliminando vehículo:', error);
    mostrarMensaje(
      'Error de conexión al eliminar vehículo', 
      'alert-danger', 
      'fa-exclamation-triangle'
    );
  } finally {
    loading.value = false;
  }
};

const limpiarFormulario = () => {
  Object.assign(vehiculo, {
    placa: '',
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    color: '',
    cliente: ''
  });
  vehiculoEditId.value = null;
  errorPlaca.value = '';
  errorMarca.value = '';
  errorColor.value = '';
  errorCliente.value = '';
  mensaje.value = '';
};

const limpiarFiltros = () => {
  filtroMarca.value = '';
  filtroPlaca.value = '';
};

const mostrarMensaje = (texto, tipo, icono) => {
  mensaje.value = texto;
  mensajeTipo.value = tipo;
  mensajeIcono.value = icono;
  
  // Auto-ocultar mensaje después de 5 segundos
  setTimeout(() => {
    if (mensaje.value === texto) {
      mensaje.value = '';
    }
  }, 5000);
};

// Cargar vehículos al montar el componente
onMounted(() => {
  cargarVehiculos();
});
</script>

<template>
  <Side/>
  <div class="main-content">
    <div class="container-fluid">
      <!-- Header con Bootstrap -->
      <div class="row align-items-center mb-4">
        <div class="col">
          <h2 class="mb-0">
            <i class="fas fa-car me-2"></i>Gestión de Vehículos
          </h2>
        </div>
        <div class="col-auto">
          <button 
            class="btn btn-warning" 
            @click="mostrarFormulario = !mostrarFormulario"
          >
            <i class="fas" :class="mostrarFormulario ? 'fa-eye-slash' : 'fa-plus'"></i>
            {{ mostrarFormulario ? 'Ocultar Formulario' : 'Nuevo Vehículo' }}
          </button>
        </div>
      </div>

      <!-- Alertas -->
      <div v-if="mensaje" class="alert" :class="mensajeTipo" role="alert">
        <i class="fas" :class="mensajeIcono"></i> {{ mensaje }}
      </div>

      <!-- Formulario con Bootstrap -->
      <div v-if="mostrarFormulario" class="card shadow-sm mb-4">
        <div class="card-header bg-dark text-warning">
          <h5 class="card-title mb-0">
            <i class="fas fa-clipboard-list me-2"></i>
            {{ vehiculoEditando ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo' }}
          </h5>
        </div>
        
        <div class="card-body">
          <form @submit.prevent="guardarVehiculo">
            <div class="row g-3">
              <!-- Columna Izquierda -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Placa *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="vehiculo.placa" 
                    required
                    :disabled="vehiculoEditando"
                    :class="{'is-invalid': errorPlaca}"
                    placeholder="Ej: ABC123"
                    maxlength="10"
                    @input="validarPlacaEnTiempoReal"
                    @blur="validarPlacaFinal"
                  >
                  <div v-if="errorPlaca" class="invalid-feedback">
                    {{ errorPlaca }}
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Marca *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="vehiculo.marca" 
                    required 
                    :disabled="loading"
                    :class="{'is-invalid': errorMarca}"
                    placeholder="Ej: Toyota"
                    @input="filtrarSoloLetras('marca')"
                    @blur="validarMarca"
                  >
                  <div v-if="errorMarca" class="invalid-feedback">
                    {{ errorMarca }}
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Modelo *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="vehiculo.modelo" 
                    required 
                    :disabled="loading"
                    placeholder="Ej: Corolla"
                  >
                </div>
              </div>
              
              <!-- Columna Derecha -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Año *</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    v-model="vehiculo.año" 
                    required
                    :disabled="loading"
                    :max="new Date().getFullYear() + 1"
                    min="1900"
                    placeholder="Ej: 2023"
                  >
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Color</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="vehiculo.color" 
                    :disabled="loading"
                    :class="{'is-invalid': errorColor}"
                    placeholder="Ej: Rojo"
                    @input="filtrarSoloLetras('color')"
                  >
                  <div v-if="errorColor" class="invalid-feedback">
                    {{ errorColor }}
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Cliente</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="vehiculo.cliente" 
                    :disabled="loading"
                    :class="{'is-invalid': errorCliente}"
                    placeholder="Ej: Juan Pérez"
                    @input="filtrarSoloLetras('cliente')"
                  >
                  <div v-if="errorCliente" class="invalid-feedback">
                    {{ errorCliente }}
                  </div>
                  <small class="form-text text-muted">Nombre del cliente propietario</small>
                </div>
              </div>
              
              <!-- Acciones -->
              <div class="col-12">
                <div class="d-flex gap-2 justify-content-end border-top pt-3">
                  <button 
                    type="button" 
                    class="btn btn-secondary" 
                    @click="limpiarFormulario"
                    :disabled="loading"
                  >
                    <i class="fas fa-times me-1"></i>Cancelar
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    :disabled="!formValido || loading"
                  >
                    <i class="fas" :class="loading ? 'fa-spinner fa-spin' : (vehiculoEditando ? 'fa-save' : 'fa-check')"></i>
                    {{ loading ? 'Procesando...' : (vehiculoEditando ? 'Actualizar' : 'Registrar') }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Filtros con Bootstrap -->
      <div class="row mb-3" v-if="vehiculos.length > 0">
        <div class="col-md-4">
          <label class="form-label">Filtrar por marca:</label>
          <select v-model="filtroMarca" class="form-select" :disabled="loading">
            <option value="">Todas las marcas</option>
            <option v-for="marca in marcasUnicas" :key="marca" :value="marca">{{ marca }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Buscar por placa:</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="filtroPlaca" 
            :disabled="loading"
            placeholder="Ingrese placa..."
          >
        </div>
        <div class="col-md-4 d-flex align-items-end">
          <button class="btn btn-outline-secondary" @click="limpiarFiltros" :disabled="loading">
            <i class="fas fa-times me-1"></i>Limpiar Filtros
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="row mb-3" v-if="vehiculos.length > 0">
        <div class="col-12">
          <div class="d-flex gap-3 flex-wrap">
            <span class="badge bg-primary fs-6">
              <i class="fas fa-car me-1"></i>Total: {{ vehiculos.length }}
            </span>
            <span class="badge bg-success fs-6" v-if="filtroMarca">
              <i class="fas fa-filter me-1"></i>Marca: {{ filtroMarca }}
            </span>
            <span class="badge bg-info fs-6" v-if="filtroPlaca">
              <i class="fas fa-search me-1"></i>Placa: {{ filtroPlaca }}
            </span>
            <span class="badge bg-warning fs-6">
              <i class="fas fa-eye me-1"></i>Mostrando: {{ vehiculosFiltrados.length }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Lista de vehículos con Bootstrap -->
      <div v-if="vehiculosFiltrados.length > 0">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">
            <i class="fas fa-list me-2"></i>Vehículos Registrados
          </h5>
          
          <div class="btn-group btn-group-sm">
            <button 
              class="btn" 
              :class="vistaGrid ? 'btn-primary' : 'btn-outline-primary'"
              @click="vistaGrid = true"
              :disabled="loading"
            >
              <i class="fas fa-th"></i> Grid
            </button>
            <button 
              class="btn" 
              :class="!vistaGrid ? 'btn-primary' : 'btn-outline-primary'"
              @click="vistaGrid = false"
              :disabled="loading"
            >
              <i class="fas fa-list"></i> Lista
            </button>
          </div>
        </div>
        
        <!-- Vista Grid con Bootstrap -->
        <div v-if="vistaGrid" class="row g-3">
          <div 
            v-for="vehiculo in vehiculosFiltrados" 
            :key="vehiculo.id" 
            class="col-xl-3 col-lg-4 col-md-6"
          >
            <div class="card h-100 shadow-sm">
              <div class="card-header bg-light py-2">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 text-uppercase fw-bold text-primary">{{ vehiculo.placa }}</h6>
                  <span class="badge bg-success">Activo</span>
                </div>
              </div>
              <div class="card-body">
                <h6 class="card-title">{{ vehiculo.marca }} {{ vehiculo.modelo }}</h6>
                <div class="card-text small">
                  <div class="mb-1">
                    <i class="fas fa-calendar text-muted me-1"></i>
                    <strong>Año:</strong> {{ vehiculo.año }}
                  </div>
                  <div class="mb-1" v-if="vehiculo.color">
                    <i class="fas fa-palette text-muted me-1"></i>
                    <strong>Color:</strong> {{ vehiculo.color }}
                  </div>
                  <div class="mb-1">
                    <i class="fas fa-user text-muted me-1"></i>
                    <strong>Cliente:</strong> {{ vehiculo.cliente || 'No especificado' }}
                  </div>
                  <div class="mb-1">
                    <i class="fas fa-hashtag text-muted me-1"></i>
                    <strong>ID:</strong> {{ vehiculo.id }}
                  </div>
                </div>
              </div>
              <div class="card-footer bg-transparent py-2">
                <div class="btn-group w-100">
                  <button 
                    class="btn btn-sm btn-outline-warning"
                    @click="editarVehiculo(vehiculo)"
                    :disabled="loading"
                    title="Editar vehículo"
                  >
                    <i class="fas fa-edit"></i> Editar
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="eliminarVehiculo(vehiculo.id)"
                    :disabled="loading"
                    title="Eliminar vehículo"
                  >
                    <i class="fas fa-trash"></i> Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Vista Lista con Bootstrap -->
        <div v-else class="list-group">
          <div 
            v-for="vehiculo in vehiculosFiltrados" 
            :key="vehiculo.id" 
            class="list-group-item list-group-item-action"
          >
            <div class="d-flex w-100 justify-content-between align-items-center">
              <div class="d-flex align-items-center flex-grow-1">
                <div class="me-4">
                  <h6 class="mb-0 text-uppercase fw-bold text-primary">{{ vehiculo.placa }}</h6>
                  <small class="text-muted">ID: {{ vehiculo.id }}</small>
                </div>
                <div class="flex-grow-1">
                  <strong class="d-block">{{ vehiculo.marca }} {{ vehiculo.modelo }}</strong>
                  <small class="text-muted d-block">
                    <i class="fas fa-calendar me-1"></i>Año: {{ vehiculo.año }} | 
                    <i class="fas fa-palette me-1"></i>Color: {{ vehiculo.color || 'N/A' }}
                  </small>
                  <small class="text-muted">
                    <i class="fas fa-user me-1"></i>Cliente: {{ vehiculo.cliente || 'No especificado' }}
                  </small>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-success">Activo</span>
                <button 
                  class="btn btn-sm btn-outline-warning"
                  @click="editarVehiculo(vehiculo)"
                  :disabled="loading"
                  title="Editar vehículo"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="btn btn-sm btn-outline-danger"
                  @click="eliminarVehiculo(vehiculo.id)"
                  :disabled="loading"
                  title="Eliminar vehículo"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Estado vacío con Bootstrap -->
      <div v-else class="text-center py-5">
        <i class="fas fa-car fa-3x mb-3 text-muted"></i>
        <h4 class="text-muted">{{ vehiculos.length === 0 ? 'No hay vehículos registrados' : 'No se encontraron resultados' }}</h4>
        <p v-if="vehiculos.length === 0 && !mostrarFormulario" class="mt-3">
          <button class="btn btn-primary" @click="mostrarFormulario = true">
            <i class="fas fa-plus me-1"></i>Registrar Primer Vehículo
          </button>
        </p>
        <p v-else-if="vehiculos.length > 0" class="text-muted">
          Intenta con otros criterios de búsqueda
          <button class="btn btn-sm btn-outline-primary ms-2" @click="limpiarFiltros">
            <i class="fas fa-times me-1"></i>Limpiar filtros
          </button>
        </p>
      </div>

      <!-- Loading overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
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
  justify-content: center;
  align-items: flex-start;
}

.card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #dee2e6;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
}

.alert {
  margin-bottom: 1rem;
  border-left: 4px solid;
  border-radius: 0.375rem;
}

.alert-success {
  border-left-color: #198754;
  background-color: #d1e7dd;
}

.alert-danger {
  border-left-color: #dc3545;
  background-color: #f8d7da;
}

.alert-warning {
  border-left-color: #ffc107;
  background-color: #fff3cd;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.text-uppercase {
  letter-spacing: 1px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.list-group-item {
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.75em;
}

@media (max-width: 992px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
    align-items: flex-start;
  }
  
  .btn-group .btn {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
  
  .card-text.small {
    font-size: 0.8rem;
  }
}

.logo-fixed {
  display: none;
}
</style>