<template>
  <div class="registro-container">
    <div class="page-header">
      <h2><i class="fas fa-car me-2"></i>Registro de Vehículo</h2>
      
    </div>

    <div class="form-container">
      <div class="form-card">
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
              <button type="submit" class="btn btn-orange" :disabled="placaExiste">
                <i class="fas fa-save me-1"></i>Registrar Vehículo
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Resumen de Vehículos Recientes -->
      <div class="recent-vehicles">
        <h5 class="section-title">Vehículos Registrados Hoy</h5>
        <div class="vehicles-grid">
          <div v-for="vehiculo in vehiculosRecientes" :key="vehiculo.id" class="vehicle-card">
            <div class="vehicle-header">
              <span class="vehicle-placa">{{ vehiculo.placa }}</span>
              <span class="vehicle-status" :class="vehiculo.estado">{{ vehiculo.estado }}</span>
            </div>
            <div class="vehicle-info">
              <div class="vehicle-marca">{{ vehiculo.marca }} {{ vehiculo.modelo }}</div>
              <div class="vehicle-cliente">{{ obtenerCliente(vehiculo.clienteId)?.nombre }}</div>
              <div class="vehicle-hora">{{ formatHora(vehiculo.fechaIngreso) }}</div>
            </div>
          </div>
        </div>
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
      marcas: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Volkswagen'],
      clientes: [
        { id: 1, nombre: 'Juan Pérez', telefono: '555-0101' },
        { id: 2, nombre: 'María García', telefono: '555-0102' }
      ],
      vehiculos: []
    }
  },
  computed: {
    placaExiste() {
      return this.vehiculos.some(v => v.placa === this.nuevoVehiculo.placa);
    },
    vehiculosRecientes() {
      const hoy = new Date().toDateString();
      return this.vehiculos.filter(v => 
        new Date(v.fechaIngreso).toDateString() === hoy
      ).slice(-5);
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
    }
  },
  mounted() {
    // Cargar datos de ejemplo
    this.vehiculos = [
      {
        id: 1,
        placa: 'ABC123',
        marca: 'Toyota',
        modelo: 'Corolla',
        clienteId: 1,
        fechaIngreso: new Date().toISOString(),
        estado: 'en_taller'
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
  margin-bottom: 2rem;
}

.page-header h2 {
  color: var(--color-dark);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-description {
  color: var(--color-orange);
  font-size: 1.1rem;
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

.btn-secondary {
  background: var(--color-olive);
  color: var(--color-dark);
}

.btn-secondary:hover {
  background: #c4c084;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
}

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.vehicle-card {
  background: var(--color-yellow);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--color-orange);
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

.vehicle-info {
  font-size: 0.9rem;
  color: var(--color-dark);
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

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 767px) {
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>