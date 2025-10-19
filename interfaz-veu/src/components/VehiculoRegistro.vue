<template>
  <div class="registro-container">
    <div class="page-header">
      <h2><i class="fas fa-car me-2"></i>Registro de Vehículo</h2>
      <div class="header-actions">
        <button 
          class="btn btn-orange" 
          @click="mostrarFormulario = !mostrarFormulario"
        >
          <i class="fas" :class="mostrarFormulario ? 'fa-eye-slash' : 'fa-eye'"></i>
          {{ mostrarFormulario ? 'Ocultar Formulario' : 'Mostrar Formulario' }}
        </button>
      </div>
    </div>

    <div class="form-container">
      <!-- Formulario con v-if para mostrar/ocultar -->
      <div v-if="mostrarFormulario" class="form-card">
        <div class="card-header bg-dark text-yellow">
          <h5 class="card-title mb-0">
            <i class="fas fa-clipboard-list me-2"></i>Datos del Vehículo
          </h5>
        </div>
        
        <div class="card-body">
          <form @submit.prevent="registrarVehiculo" class="form-grid">
            <!-- Columna Izquierda -->
            <div class="form-column">
              <div class="form-group">
                <label class="form-label">Marca *</label>
                <select class="form-control" v-model="nuevoVehiculo.marca" required>
                  <option value="">Seleccionar marca</option>
                  <option v-for="marca in marcas" :key="marca" :value="marca">{{ marca }}</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Modelo *</label>
                <input type="text" class="form-control" v-model="nuevoVehiculo.modelo" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">Placa *</label>
                <input type="text" class="form-control" v-model="nuevoVehiculo.placa" required 
                       :class="{'input-error': placaExiste}">
                <div v-if="placaExiste" class="error-message">
                  Esta placa ya está registrada en el sistema
                </div>
              </div>
            </div>
            
            <!-- Columna Derecha -->
            <div class="form-column">
              <div class="form-group">
                <label class="form-label">Cliente *</label>
                <select class="form-control" v-model="nuevoVehiculo.clienteId" required>
                  <option value="">Seleccionar cliente</option>
                  <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                    {{ cliente.nombre }} - {{ cliente.telefono }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Fecha y Hora de Ingreso *</label>
                <input type="datetime-local" class="form-control" v-model="nuevoVehiculo.fechaIngreso" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">Kilometraje</label>
                <div class="input-with-suffix">
                  <input type="number" class="form-control" v-model="nuevoVehiculo.kilometraje">
                  <span class="input-suffix">km</span>
                </div>
              </div>
            </div>
            
            <!-- Observaciones -->
            <div class="form-full">
              <div class="form-group">
                <label class="form-label">Estado Inicial / Observaciones</label>
                <textarea class="form-control" rows="3" v-model="nuevoVehiculo.observaciones"
                          placeholder="Describa el estado general del vehículo al momento del ingreso..."></textarea>
              </div>
            </div>
            
            <!-- Acciones -->
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="limpiarFormulario">
                <i class="fas fa-sync me-1"></i>Limpiar
              </button>
              <button type="submit" class="btn btn-orange" :disabled="placaExiste || !formValido">
                <i class="fas fa-save me-1"></i>Registrar Vehículo
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Filtros para la lista de vehículos -->
      <div class="filters-container" v-if="vehiculos.length > 0">
        <div class="filter-group">
          <label>Filtrar por marca:</label>
          <select v-model="filtroMarca" class="form-control filter-select">
            <option value="">Todas las marcas</option>
            <option v-for="marca in marcasUnicas" :key="marca" :value="marca">{{ marca }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Filtrar por estado:</label>
          <select v-model="filtroEstado" class="form-control filter-select">
            <option value="">Todos los estados</option>
            <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
          </select>
        </div>
        <button class="btn btn-secondary" @click="limpiarFiltros">
          <i class="fas fa-times me-1"></i>Limpiar Filtros
        </button>
      </div>
      
      <!-- Resumen de Vehículos con más funcionalidades -->
      <div class="recent-vehicles" v-if="vehiculosFiltrados.length > 0">
        <h5 class="section-title">
          Vehículos Registrados 
          <span class="badge bg-orange">{{ vehiculosFiltrados.length }}</span>
        </h5>
        
        <!-- Selector de vista -->
        <div class="view-options">
          <button 
            class="btn btn-sm" 
            :class="vistaGrid ? 'btn-orange' : 'btn-secondary'"
            @click="vistaGrid = true"
          >
            <i class="fas fa-th"></i> Grid
          </button>
          <button 
            class="btn btn-sm" 
            :class="!vistaGrid ? 'btn-orange' : 'btn-secondary'"
            @click="vistaGrid = false"
          >
            <i class="fas fa-list"></i> Lista
          </button>
        </div>
        
        <!-- Vista Grid -->
        <div v-if="vistaGrid" class="vehicles-grid">
          <div 
            v-for="vehiculo in vehiculosFiltrados" 
            :key="vehiculo.id" 
            class="vehicle-card"
            :class="{'vehicle-card-highlight': esVehiculoReciente(vehiculo)}"
          >
            <div class="vehicle-header">
              <span class="vehicle-placa">{{ vehiculo.placa }}</span>
              <span class="vehicle-status" :class="vehiculo.estado">
                {{ formatoEstado(vehiculo.estado) }}
              </span>
            </div>
            <div class="vehicle-info">
              <div class="vehicle-marca">{{ vehiculo.marca }} {{ vehiculo.modelo }}</div>
              <div class="vehicle-cliente">{{ obtenerCliente(vehiculo.clienteId)?.nombre }}</div>
              <div class="vehicle-hora">{{ formatHora(vehiculo.fechaIngreso) }}</div>
              <div class="vehicle-km" v-if="vehiculo.kilometraje">
                {{ vehiculo.kilometraje.toLocaleString() }} km
              </div>
            </div>
            <div class="vehicle-actions">
              <button 
                class="btn btn-sm btn-outline-orange"
                @click="seleccionarVehiculo(vehiculo)"
                :title="`Ver detalles de ${vehiculo.placa}`"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button 
                class="btn btn-sm btn-outline-red"
                @click="eliminarVehiculo(vehiculo.id)"
                :title="`Eliminar ${vehiculo.placa}`"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Vista Lista -->
        <div v-else class="vehicles-list">
          <div 
            v-for="vehiculo in vehiculosFiltrados" 
            :key="vehiculo.id" 
            class="vehicle-list-item"
          >
            <div class="list-item-main">
              <div class="list-item-placa">{{ vehiculo.placa }}</div>
              <div class="list-item-info">
                <strong>{{ vehiculo.marca }} {{ vehiculo.modelo }}</strong>
                <span>{{ obtenerCliente(vehiculo.clienteId)?.nombre }}</span>
                <small>{{ formatHora(vehiculo.fechaIngreso) }}</small>
              </div>
            </div>
            <div class="list-item-actions">
              <span class="vehicle-status" :class="vehiculo.estado">
                {{ formatoEstado(vehiculo.estado) }}
              </span>
              <button 
                class="btn btn-sm btn-outline-orange"
                @click="seleccionarVehiculo(vehiculo)"
              >
                <i class="fas fa-eye"></i> Ver
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mensaje cuando no hay vehículos -->
      <div v-else class="empty-state">
        <i class="fas fa-car fa-3x mb-3 text-orange"></i>
        <h4>No hay vehículos registrados</h4>
        <p v-if="!mostrarFormulario">
          <button class="btn btn-orange" @click="mostrarFormulario = true">
            <i class="fas fa-plus me-1"></i>Registrar Primer Vehículo
          </button>
        </p>
        <p v-else>Comienza registrando tu primer vehículo</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VehiculoRegistro',
  data() {
    return {
      nuevoVehiculo: {
        marca: '',
        modelo: '',
        placa: '',
        anio: new Date().getFullYear(),
        clienteId: null,
        fechaIngreso: this.getCurrentDateTime(),
        kilometraje: 0,
        observaciones: ''
      },
      mostrarFormulario: true,
      vistaGrid: true,
      filtroMarca: '',
      filtroEstado: '',
      marcas: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Volkswagen'],
      clientes: [
        { id: 1, nombre: 'Juan Pérez', telefono: '555-0101' },
        { id: 2, nombre: 'María García', telefono: '555-0102' },
        { id: 3, nombre: 'Carlos López', telefono: '555-0103' }
      ],
      vehiculos: [],
      estados: ['en_taller', 'en_reparacion', 'completado', 'entregado']
    }
  },
  computed: {
    placaExiste() {
      return this.vehiculos.some(v => v.placa === this.nuevoVehiculo.placa && v.placa !== '');
    },
    formValido() {
      return this.nuevoVehiculo.marca && 
             this.nuevoVehiculo.modelo && 
             this.nuevoVehiculo.placa && 
             this.nuevoVehiculo.clienteId &&
             this.nuevoVehiculo.fechaIngreso;
    },
    marcasUnicas() {
      return [...new Set(this.vehiculos.map(v => v.marca))];
    },
    vehiculosFiltrados() {
      let filtrados = this.vehiculos;
      
      if (this.filtroMarca) {
        filtrados = filtrados.filter(v => v.marca === this.filtroMarca);
      }
      
      if (this.filtroEstado) {
        filtrados = filtrados.filter(v => v.estado === this.filtroEstado);
      }
      
      return filtrados;
    }
  },
  methods: {
    getCurrentDateTime() {
      const now = new Date();
      return now.toISOString().slice(0, 16);
    },
    limpiarFormulario() {
      this.nuevoVehiculo = {
        marca: '',
        modelo: '',
        placa: '',
        anio: new Date().getFullYear(),
        clienteId: null,
        fechaIngreso: this.getCurrentDateTime(),
        kilometraje: 0,
        observaciones: ''
      };
    },
    limpiarFiltros() {
      this.filtroMarca = '';
      this.filtroEstado = '';
    },
    registrarVehiculo() {
      if (this.placaExiste) {
        alert('Error: La placa ya está registrada en el sistema');
        return;
      }
      
      const nuevoVehiculo = {
        id: Date.now(),
        ...this.nuevoVehiculo,
        estado: 'en_taller'
      };
      
      this.vehiculos.push(nuevoVehiculo);
      this.limpiarFormulario();
      alert('✅ Vehículo registrado exitosamente');
    },
    obtenerCliente(id) {
      return this.clientes.find(c => c.id === id);
    },
    formatHora(fechaHora) {
      return new Date(fechaHora).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },
    formatoEstado(estado) {
      const estados = {
        'en_taller': 'En Taller',
        'en_reparacion': 'En Reparación',
        'completado': 'Completado',
        'entregado': 'Entregado'
      };
      return estados[estado] || estado;
    },
    esVehiculoReciente(vehiculo) {
      const unaHora = 60 * 60 * 1000;
      return (Date.now() - new Date(vehiculo.fechaIngreso).getTime()) < unaHora;
    },
    seleccionarVehiculo(vehiculo) {
      alert(`Seleccionado: ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.placa}`);
    },
    eliminarVehiculo(id) {
      if (confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
        this.vehiculos = this.vehiculos.filter(v => v.id !== id);
      }
    }
  },
  mounted() {
    this.vehiculos = [
      {
        id: 1,
        placa: 'ABC123',
        marca: 'Toyota',
        modelo: 'Corolla',
        clienteId: 1,
        fechaIngreso: new Date().toISOString(),
        estado: 'en_taller',
        kilometraje: 45000,
        observaciones: 'Vehículo en buen estado general'
      },
      {
        id: 2,
        placa: 'XYZ789',
        marca: 'Honda',
        modelo: 'Civic',
        clienteId: 2,
        fechaIngreso: new Date().toISOString(),
        estado: 'en_reparacion',
        kilometraje: 32000,
        observaciones: 'Requiere cambio de aceite'
      }
    ];
  }
}
</script>

<style scoped>
.registro-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h2 {
  color: var(--color-dark);
  font-weight: 700;
  margin-bottom: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.form-container {
  display: grid;
  gap: 2rem;
}

.form-card {
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(48, 35, 37, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
}

.card-body {
  padding: 2rem;
}

.form-grid {
  display: grid;
  gap: 1.5rem;
}

.form-column {
  display: grid;
  gap: 1rem;
}

.form-full {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: 0.5rem;
}

.form-control {
  padding: 0.75rem;
  border: 2px solid var(--color-olive);
  border-radius: 8px;
  transition: all 0.3s ease;
  background: var(--color-white);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-orange);
  box-shadow: 0 0 0 3px rgba(238, 127, 39, 0.1);
}

.input-error {
  border-color: var(--color-red) !important;
}

.error-message {
  color: var(--color-red);
  font-size: 0.85rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-suffix {
  position: absolute;
  right: 0.75rem;
  color: var(--color-orange);
  font-weight: 600;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--color-olive);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-secondary {
  background: var(--color-olive);
  color: var(--color-dark);
}

.btn-secondary:hover {
  background: #c4c084;
}

.btn-outline-orange {
  background: transparent;
  border: 2px solid var(--color-orange);
  color: var(--color-orange);
}

.btn-outline-orange:hover {
  background: var(--color-orange);
  color: white;
}

.btn-outline-red {
  background: transparent;
  border: 2px solid var(--color-red);
  color: var(--color-red);
}

.btn-outline-red:hover {
  background: var(--color-red);
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Filtros */
.filters-container {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(48, 35, 37, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 0.9rem;
}

.filter-select {
  min-width: 150px;
}

/* Lista de vehículos */
.recent-vehicles {
  background: var(--color-white);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(48, 35, 37, 0.1);
}

.section-title {
  color: var(--color-dark);
  margin-bottom: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.bg-orange {
  background: var(--color-orange);
  color: white;
}

.view-options {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* Vista Grid */
.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.vehicle-card {
  background: var(--color-yellow);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--color-orange);
  transition: all 0.3s ease;
}

.vehicle-card-highlight {
  border-left-color: var(--color-red);
  background: linear-gradient(135deg, var(--color-yellow) 0%, #f8d7a4 100%);
}

.vehicle-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(48, 35, 37, 0.2);
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.vehicle-placa {
  font-weight: 700;
  color: var(--color-dark);
  font-size: 1.1rem;
}

.vehicle-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
}

.vehicle-status.en_taller {
  background: var(--color-orange);
  color: white;
}

.vehicle-status.en_reparacion {
  background: var(--color-red);
  color: white;
}

.vehicle-status.completado {
  background: var(--color-olive);
  color: var(--color-dark);
}

.vehicle-status.entregado {
  background: var(--color-dark);
  color: white;
}

.vehicle-info {
  font-size: 0.9rem;
  color: var(--color-dark);
  margin-bottom: 0.5rem;
}

.vehicle-info div {
  margin-bottom: 0.25rem;
}

.vehicle-marca {
  font-weight: 600;
}

.vehicle-cliente {
  opacity: 0.8;
}

.vehicle-hora {
  color: var(--color-red);
  font-weight: 600;
}

.vehicle-km {
  color: var(--color-orange);
  font-weight: 600;
}

.vehicle-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Vista Lista */
.vehicles-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vehicle-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-yellow);
  border-radius: 8px;
  border-left: 4px solid var(--color-orange);
}

.list-item-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.list-item-placa {
  font-weight: 700;
  color: var(--color-dark);
  font-size: 1.1rem;
  min-width: 80px;
}

.list-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.list-item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 3rem;
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(48, 35, 37, 0.1);
  color: var(--color-dark);
}

.empty-state h4 {
  margin-bottom: 0.5rem;
  color: var(--color-orange);
}

.empty-state p {
  color: var(--color-dark);
  opacity: 0.7;
}

/* Responsive */
@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .vehicle-list-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .list-item-actions {
    justify-content: space-between;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
}
</style>