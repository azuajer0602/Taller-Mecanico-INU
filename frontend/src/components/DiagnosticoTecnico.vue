<template>
  <div class="diagnostico-container container-fluid py-4">
    <div class="page-header mb-4">
      <h2 class="mb-0 text-dark fw-bold">
        <i class="fas fa-stethoscope me-2 text-primary"></i>Diagnóstico Técnico
      </h2>
      <p class="text-muted mb-0">Sistema completo de diagnóstico para vehículos</p>
    </div>

    <!-- Alertas -->
    <div v-if="mensaje" class="alert" :class="mensajeTipo" role="alert">
      <i class="fas" :class="mensajeIcono"></i> {{ mensaje }}
    </div>

    <!-- Selector de Vehículo -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-dark text-warning">
        <h5 class="mb-0">
          <i class="fas fa-car me-2"></i>Seleccionar Vehículo para Diagnóstico
        </h5>
      </div>
      <div class="card-body">
        <div class="row align-items-end">
          <div class="col-md-8">
            <label class="form-label fw-semibold">Vehículo *</label>
            <select class="form-select" v-model="vehiculoSeleccionado" @change="onVehiculoSeleccionado" :disabled="loading">
              <option value="">Seleccionar vehículo...</option>
              <option v-for="vehiculo in vehiculos" :key="vehiculo.id" :value="vehiculo.id">
                {{ vehiculo.placa }} - {{ vehiculo.marca }} {{ vehiculo.modelo }} ({{ vehiculo.año }})
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <button class="btn btn-outline-primary w-100" @click="cargarVehiculos" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Actualizar Lista
            </button>
          </div>
        </div>
        <small class="form-text text-muted mt-2">
          Seleccione un vehículo registrado para realizar el diagnóstico técnico.
        </small>
      </div>
    </div>

    <!-- Información del Vehículo Seleccionado -->
    <div v-if="vehiculoSeleccionado && vehiculoActual" class="card border-primary mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="fas fa-info-circle me-2"></i>Información del Vehículo Seleccionado
        </h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <strong>Placa:</strong> {{ vehiculoActual.placa }}
          </div>
          <div class="col-md-3">
            <strong>Marca/Modelo:</strong> {{ vehiculoActual.marca }} {{ vehiculoActual.modelo }}
          </div>
          <div class="col-md-3">
            <strong>Año:</strong> {{ vehiculoActual.año }}
          </div>
          <div class="col-md-3">
            <strong>Color:</strong> {{ vehiculoActual.color || 'N/A' }}
          </div>
        </div>
        <div class="row mt-2" v-if="vehiculoActual.cliente">
          <div class="col-12">
            <strong>Cliente:</strong> {{ vehiculoActual.cliente }}
          </div>
        </div>
      </div>
    </div>

    <!-- Sistema de Diagnóstico (SOLO se muestra cuando hay vehículo seleccionado) -->
    <div v-if="vehiculoSeleccionado && vehiculoActual">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="text-dark mb-0">
          <i class="fas fa-clipboard-list me-2 text-warning"></i>Sistemas del Vehículo
        </h4>
        <div class="btn-group">
          <button class="btn btn-outline-success btn-sm" @click="expandirTodos">
            <i class="fas fa-expand me-1"></i>Expandir Todos
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="colapsarTodos">
            <i class="fas fa-compress me-1"></i>Colapsar Todos
          </button>
        </div>
      </div>

      <!-- Acordeón de Sistemas -->
      <div class="accordion" id="diagnosticoAccordion">
        <div class="accordion-item" v-for="sistema in sistemas" :key="sistema.id">
          <h2 class="accordion-header">
            <button 
              class="accordion-button" 
              :class="{ collapsed: sistemaAbierto !== sistema.id }"
              type="button" 
              @click="toggleSistema(sistema.id)"
            >
              <div class="d-flex align-items-center w-100">
                <div class="sistema-icon rounded p-2 me-3 text-white" :class="sistema.color">
                  <i :class="sistema.icono"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="mb-1 fw-semibold">{{ sistema.nombre }}</h6>
                  <span class="badge" :class="getStatusClass(diagnosticoActual[sistema.id].estado)">
                    {{ getStatusText(diagnosticoActual[sistema.id].estado) }}
                  </span>
                </div>
                <div class="ms-2">
                  <small class="text-muted">
                    {{ diagnosticoActual[sistema.id].fallas.length }} falla(s)
                  </small>
                </div>
              </div>
            </button>
          </h2>
          <div 
            class="accordion-collapse collapse" 
            :class="{ show: sistemaAbierto === sistema.id }"
          >
            <div class="accordion-body bg-light">
              <!-- Contenido del sistema -->
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Estado del Sistema *</label>
                  <select class="form-select" v-model="diagnosticoActual[sistema.id].estado" :disabled="loading">
                    <option value="optimo">✅ Óptimo</option>
                    <option value="leve">⚠️ Problemas Leves</option>
                    <option value="moderado">🔧 Problemas Moderados</option>
                    <option value="critico">🚨 Crítico</option>
                  </select>
                </div>
                
                <div class="col-md-6" v-if="sistema.id === 'frenos'">
                  <label class="form-label fw-semibold">Nivel de Desgaste</label>
                  <select class="form-select" v-model="diagnosticoActual[sistema.id].nivelDesgaste" :disabled="loading">
                    <option value="nuevo">Nuevo (0-20%)</option>
                    <option value="medio">Medio (21-60%)</option>
                    <option value="avanzado">Avanzado (61-90%)</option>
                    <option value="critico">Crítico (91-100%)</option>
                  </select>
                </div>
              </div>
              
              <div class="mt-4">
                <label class="form-label fw-semibold">Fallas Detectadas</label>
                <div class="row g-2">
                  <div class="col-md-6 col-lg-4" v-for="falla in sistema.fallas" :key="falla.id">
                    <div class="form-check p-2 border rounded hover-shadow">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :id="`falla-${sistema.id}-${falla.id}`"
                        v-model="diagnosticoActual[sistema.id].fallas" 
                        :value="falla.id"
                        :disabled="loading"
                      >
                      <label class="form-check-label w-100" :for="`falla-${sistema.id}-${falla.id}`">
                        {{ falla.descripcion }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <label class="form-label fw-semibold">Observaciones</label>
                <textarea 
                  class="form-control" 
                  rows="3" 
                  v-model="diagnosticoActual[sistema.id].observaciones"
                  :disabled="loading"
                  :placeholder="`Describa el estado del ${sistema.nombre.toLowerCase()}...`"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones del Diagnóstico -->
      <div class="card mt-4 border-primary">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="fas fa-tools me-2"></i>Acciones del Diagnóstico
          </h5>
          <div>
            <span class="badge bg-secondary me-2">
              Sistemas: {{ sistemasCompletados }}/{{ sistemas.length }}
            </span>
            <span class="badge bg-info">
              Fallas: {{ totalFallas }}
            </span>
          </div>
        </div>
        <div class="card-body">
          <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center">
            <div>
              <button class="btn btn-secondary me-2" @click="limpiarDiagnostico" :disabled="loading">
                <i class="fas fa-eraser me-1"></i>Limpiar Todo
              </button>
              <button class="btn btn-outline-warning" @click="mostrarResumen = !mostrarResumen">
                <i class="fas" :class="mostrarResumen ? 'fa-eye-slash' : 'fa-eye'"></i>
                {{ mostrarResumen ? 'Ocultar' : 'Ver' }} Resumen
              </button>
            </div>
            <button class="btn btn-success" @click="guardarDiagnostico" :disabled="!diagnosticoCompleto || loading">
              <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ loading ? 'Guardando...' : 'Guardar Diagnóstico' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Resumen del Diagnóstico -->
      <div class="card mt-4 border-warning" v-if="mostrarResumen">
        <div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="fas fa-chart-bar me-2"></i>Resumen del Diagnóstico
          </h5>
          <button class="btn btn-sm btn-outline-dark" @click="mostrarResumen = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="card-body">
          <div class="row g-3 mb-4">
            <div class="col-md-6 col-lg-3" v-for="sistema in sistemas" :key="sistema.id">
              <div class="d-flex justify-content-between align-items-center p-3 border rounded bg-white shadow-sm">
                <div class="d-flex align-items-center">
                  <div class="sistema-icon-sm rounded p-1 me-2 text-white" :class="sistema.color">
                    <i :class="sistema.icono"></i>
                  </div>
                  <span class="fw-semibold">{{ sistema.nombre }}</span>
                </div>
                <span class="badge" :class="getStatusClass(diagnosticoActual[sistema.id].estado)">
                  {{ getStatusText(diagnosticoActual[sistema.id].estado) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="mt-4" v-if="tieneFallas">
            <h6 class="fw-semibold border-bottom pb-2">Fallas Detectadas:</h6>
            <div class="row g-2">
              <div 
                v-for="sistema in sistemas" 
                :key="sistema.id"
                class="col-12"
                v-if="diagnosticoActual[sistema.id].fallas.length > 0"
              >
                <div class="alert alert-warning py-2">
                  <strong>{{ sistema.nombre }}:</strong>
                  {{ diagnosticoActual[sistema.id].fallas.map(fallaId => 
                    sistema.fallas.find(f => f.id === fallaId)?.descripcion
                  ).join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado cuando no hay vehículo seleccionado -->
    <div v-else-if="vehiculos.length > 0" class="card text-center py-5">
      <div class="card-body">
        <div class="text-primary mb-4">
          <i class="fas fa-car fa-4x opacity-75"></i>
        </div>
        <h3 class="text-dark mb-3">Seleccione un Vehículo</h3>
        <p class="text-muted mb-4 fs-5">
          Elija un vehículo de la lista superior para comenzar el diagnóstico.
        </p>
      </div>
    </div>

    <!-- Estado cuando no hay vehículos -->
    <div v-else class="card text-center py-5">
      <div class="card-body">
        <div class="text-warning mb-4">
          <i class="fas fa-exclamation-triangle fa-3x"></i>
        </div>
        <h4 class="text-dark mb-3">No hay vehículos registrados</h4>
        <p class="text-muted mb-4">
          Para realizar diagnósticos, primero debe registrar vehículos en el sistema.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
const API_BASE = 'http://localhost:3000/api';

export default {
  name: 'DiagnosticoTecnico',
  data() {
    return {
      vehiculoSeleccionado: '',
      vehiculoActual: null,
      vehiculos: [],
      sistemaAbierto: 'motor',
      mostrarResumen: true,
      loading: false,
      mensaje: '',
      mensajeTipo: 'alert-success',
      mensajeIcono: 'fa-check',
      
      sistemas: [
        {
          id: 'motor',
          nombre: 'Motor',
          icono: 'fas fa-cog',
          color: 'bg-danger',
          fallas: [
            { id: 'm1', descripcion: 'Fuga de aceite' },
            { id: 'm2', descripcion: 'Sobrecalentamiento' },
            { id: 'm3', descripcion: 'Pérdida de potencia' },
            { id: 'm4', descripcion: 'Ruidos anormales' }
          ]
        },
        {
          id: 'frenos',
          nombre: 'Frenos',
          icono: 'fas fa-tachometer-alt',
          color: 'bg-warning',
          fallas: [
            { id: 'f1', descripcion: 'Desgaste de pastillas' },
            { id: 'f2', descripcion: 'Fuga de líquido' },
            { id: 'f3', descripcion: 'Vibración al frenar' }
          ]
        },
        {
          id: 'suspension',
          nombre: 'Suspensión',
          icono: 'fas fa-compass',
          color: 'bg-info',
          fallas: [
            { id: 's1', descripcion: 'Amortiguadores' },
            { id: 's2', descripcion: 'Terminales' },
            { id: 's3', descripcion: 'Brazos de control' }
          ]
        },
        {
          id: 'electrico',
          nombre: 'Eléctrico',
          icono: 'fas fa-bolt',
          color: 'bg-success',
          fallas: [
            { id: 'e1', descripcion: 'Problemas de batería' },
            { id: 'e2', descripcion: 'Alternador' },
            { id: 'e3', descripcion: 'Cortocircuitos' }
          ]
        }
      ],
      diagnosticoActual: {
        motor: { estado: 'optimo', fallas: [], observaciones: '' },
        frenos: { estado: 'optimo', nivelDesgaste: 'medio', fallas: [], observaciones: '' },
        suspension: { estado: 'optimo', fallas: [], observaciones: '' },
        electrico: { estado: 'optimo', fallas: [], observaciones: '' }
      }
    }
  },
  computed: {
    diagnosticoCompleto() {
      return Object.values(this.diagnosticoActual).some(sistema => 
        sistema.estado !== 'optimo' || 
        sistema.fallas.length > 0 || 
        sistema.observaciones.trim() !== ''
      );
    },
    tieneFallas() {
      return Object.values(this.diagnosticoActual).some(sistema => sistema.fallas.length > 0);
    },
    sistemasCompletados() {
      return Object.values(this.diagnosticoActual).filter(sistema => 
        sistema.estado !== 'optimo' || sistema.fallas.length > 0 || sistema.observaciones.trim() !== ''
      ).length;
    },
    totalFallas() {
      return Object.values(this.diagnosticoActual).reduce((total, sistema) => 
        total + sistema.fallas.length, 0
      );
    }
  },
  methods: {
    // ✅ MÉTODO CORREGIDO - Ahora sí se ejecuta al seleccionar vehículo
    onVehiculoSeleccionado() {
      console.log('Vehículo seleccionado:', this.vehiculoSeleccionado);
      
      if (this.vehiculoSeleccionado) {
        this.vehiculoActual = this.vehiculos.find(v => v.id == this.vehiculoSeleccionado);
        console.log('Vehículo actual:', this.vehiculoActual);
        
        if (this.vehiculoActual) {
          this.limpiarDiagnostico();
          this.mostrarResumen = true;
          this.sistemaAbierto = 'motor'; // Abre el primer sistema
        }
      } else {
        this.vehiculoActual = null;
      }
    },

    toggleSistema(sistemaId) {
      this.sistemaAbierto = this.sistemaAbierto === sistemaId ? null : sistemaId;
    },
    
    expandirTodos() {
      this.sistemaAbierto = 'motor';
    },
    
    colapsarTodos() {
      this.sistemaAbierto = null;
    },
    
    async cargarVehiculos() {
      this.loading = true;
      try {
        console.log('Cargando vehículos...');
        const response = await fetch(`${API_BASE}/vehiculos`);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Respuesta vehículos:', data);
        
        if (data.success) {
          this.vehiculos = data.data;
          console.log(`✅ Cargados ${this.vehiculos.length} vehículos`);
        } else {
          throw new Error(data.message || 'Error en la respuesta');
        }
      } catch (error) {
        console.error('Error cargando vehículos:', error);
        this.mostrarMensaje(
          'Error al cargar vehículos: ' + error.message, 
          'alert-danger', 
          'fa-exclamation-triangle'
        );
      } finally {
        this.loading = false;
      }
    },
    
    async guardarDiagnostico() {
      if (!this.diagnosticoCompleto) {
        this.mostrarMensaje('Complete al menos un sistema', 'alert-warning', 'fa-exclamation-circle');
        return;
      }

      this.loading = true;
      try {
        const diagnosticoData = {
          vehiculoId: parseInt(this.vehiculoSeleccionado),
          problema: this.generarDescripcionProblema(),
          descripcion: this.generarDescripcionCompleta(),
          estado: 'En revisión'
        };

        console.log('Enviando diagnóstico:', diagnosticoData);

        const response = await fetch(`${API_BASE}/diagnosticos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(diagnosticoData)
        });

        const data = await response.json();
        console.log('Respuesta guardar diagnóstico:', data);
        
        if (data.success) {
          this.mostrarMensaje('✅ Diagnóstico guardado', 'alert-success', 'fa-check-circle');
          this.vehiculoSeleccionado = '';
          this.vehiculoActual = null;
          this.limpiarDiagnostico();
        } else {
          this.mostrarMensaje('❌ Error: ' + data.message, 'alert-danger', 'fa-exclamation-triangle');
        }
      } catch (error) {
        console.error('Error guardando diagnóstico:', error);
        this.mostrarMensaje('❌ Error de conexión', 'alert-danger', 'fa-exclamation-triangle');
      } finally {
        this.loading = false;
      }
    },
    
    generarDescripcionProblema() {
      const sistemasConProblemas = this.sistemas.filter(sistema => 
        this.diagnosticoActual[sistema.id].estado !== 'optimo' || 
        this.diagnosticoActual[sistema.id].fallas.length > 0
      );
      
      if (sistemasConProblemas.length === 0) {
        return 'Diagnóstico preventivo';
      }
      
      return sistemasConProblemas.map(sistema => sistema.nombre).join(', ');
    },
    
    generarDescripcionCompleta() {
      let descripcion = `Diagnóstico del vehículo ${this.vehiculoActual?.placa}\n\n`;
      
      this.sistemas.forEach(sistema => {
        const datos = this.diagnosticoActual[sistema.id];
        if (datos.estado !== 'optimo' || datos.fallas.length > 0 || datos.observaciones) {
          descripcion += `${sistema.nombre}: ${this.getStatusText(datos.estado)}\n`;
          if (datos.fallas.length > 0) {
            descripcion += `Fallas: ${datos.fallas.map(f => 
              sistema.fallas.find(sf => sf.id === f)?.descripcion
            ).join(', ')}\n`;
          }
          if (datos.observaciones.trim()) {
            descripcion += `Observaciones: ${datos.observaciones}\n`;
          }
          descripcion += '\n';
        }
      });
      
      return descripcion;
    },
    
    limpiarDiagnostico() {
      this.diagnosticoActual = {
        motor: { estado: 'optimo', fallas: [], observaciones: '' },
        frenos: { estado: 'optimo', nivelDesgaste: 'medio', fallas: [], observaciones: '' },
        suspension: { estado: 'optimo', fallas: [], observaciones: '' },
        electrico: { estado: 'optimo', fallas: [], observaciones: '' }
      };
    },
    
    getStatusClass(estado) {
      const clases = {
        optimo: 'bg-success',
        leve: 'bg-warning text-dark',
        moderado: 'bg-warning text-dark',
        critico: 'bg-danger'
      };
      return clases[estado] || 'bg-success';
    },
    
    getStatusText(estado) {
      const textos = {
        optimo: 'Óptimo',
        leve: 'Leves',
        moderado: 'Moderados',
        critico: 'Crítico'
      };
      return textos[estado] || 'Óptimo';
    },
    
    mostrarMensaje(texto, tipo, icono) {
      this.mensaje = texto;
      this.mensajeTipo = tipo;
      this.mensajeIcono = icono;
      
      setTimeout(() => {
        this.mensaje = '';
      }, 5000);
    }
  },
  async mounted() {
    console.log('Componente montado - Cargando vehículos...');
    await this.cargarVehiculos();
  }
}
</script>

<style scoped>
.hover-shadow:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transform: translateY(-1px);
  transition: all 0.3s ease;
}

.sistema-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sistema-icon-sm {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
}

.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.alert {
  border-left: 4px solid;
}

.alert-success { border-left-color: #198754; }
.alert-danger { border-left-color: #dc3545; }
.alert-warning { border-left-color: #ffc107; }
</style>