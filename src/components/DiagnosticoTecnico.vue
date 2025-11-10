<template>
  <div class="diagnostico-container">
    <div class="page-header">
      <h2><i class="fas fa-stethoscope me-2"></i>Diagnóstico Técnico</h2>

    </div>

    <div class="diagnostico-content">
      <!-- Selector de Vehículo -->
      <div class="vehicle-selector-card">
        <div class="selector-header">
          <h5>Seleccionar Vehículo para Diagnóstico</h5>
        </div>
        <div class="selector-body">
          <select class="form-control" v-model="vehiculoSeleccionado" @change="cargarDiagnostico">
            <option value="">Seleccionar vehículo...</option>
            <option v-for="vehiculo in vehiculosEnTaller" :key="vehiculo.id" :value="vehiculo.id">
              {{ vehiculo.placa }} - {{ vehiculo.marca }} {{ vehiculo.modelo }}
            </option>
          </select>
        </div>
      </div>

      <!-- Sistema de Acordeón para Diagnósticos -->
      <div class="accordion-system" v-if="vehiculoSeleccionado">
        <div class="accordion-item" v-for="sistema in sistemas" :key="sistema.id">
          <div class="accordion-header" @click="toggleSistema(sistema.id)">
            <div class="sistema-info">
              <div class="sistema-icon" :class="sistema.color">
                <i :class="sistema.icono"></i>
              </div>
              <div class="sistema-details">
                <h6 class="sistema-name">{{ sistema.nombre }}</h6>
                <span class="sistema-status" :class="getStatusClass(diagnosticoActual[sistema.id].estado)">
                  {{ getStatusText(diagnosticoActual[sistema.id].estado) }}
                </span>
              </div>
            </div>
            <div class="accordion-arrow">
              <i class="fas fa-chevron-down" :class="{ rotated: sistemaAbierto === sistema.id }"></i>
            </div>
          </div>
          
          <div class="accordion-content" :class="{ open: sistemaAbierto === sistema.id }">
            <div class="sistema-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Estado del Sistema</label>
                  <select class="form-control" v-model="diagnosticoActual[sistema.id].estado">
                    <option value="optimo">Óptimo</option>
                    <option value="leve">Problemas Leves</option>
                    <option value="moderado">Problemas Moderados</option>
                    <option value="critico">Crítico</option>
                  </select>
                </div>
                
                <div class="form-group" v-if="sistema.id === 'frenos'">
                  <label class="form-label">Nivel de Desgaste</label>
                  <select class="form-control" v-model="diagnosticoActual[sistema.id].nivelDesgaste">
                    <option value="nuevo">Nuevo (0-20%)</option>
                    <option value="medio">Medio (21-60%)</option>
                    <option value="avanzado">Avanzado (61-90%)</option>
                    <option value="critico">Crítico (91-100%)</option>
                  </select>
                </div>
              </div>
              
              <div class="fallas-section">
                <label class="form-label">Fallas Detectadas</label>
                <div class="fallas-grid">
                  <div class="falla-item" v-for="falla in sistema.fallas" :key="falla.id">
                    <input 
                      type="checkbox" 
                      :id="`falla-${sistema.id}-${falla.id}`"
                      v-model="diagnosticoActual[sistema.id].fallas" 
                      :value="falla.id"
                    >
                    <label :for="`falla-${sistema.id}-${falla.id}`">{{ falla.descripcion }}</label>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Observaciones y Recomendaciones</label>
                <textarea 
                  class="form-control" 
                  rows="4" 
                  v-model="diagnosticoActual[sistema.id].observaciones"
                  :placeholder="`Describa en detalle el estado del ${sistema.nombre.toLowerCase()}...`"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Acciones -->
        <div class="diagnostico-actions">
          <button class="btn btn-secondary" @click="limpiarDiagnostico">
            <i class="fas fa-eraser me-1"></i>Limpiar
          </button>
          <button class="btn btn-orange" @click="guardarDiagnostico">
            <i class="fas fa-save me-1"></i>Guardar Diagnóstico
          </button>
          <button class="btn btn-red" @click="generarReporte">
            <i class="fas fa-file-pdf me-1"></i>Generar Reporte PDF
          </button>
        </div>
      </div>
      
      <!-- Mensaje cuando no hay vehículo seleccionado -->
      <div v-else class="no-vehicle-message">
        <div class="message-icon">
          <i class="fas fa-car"></i>
        </div>
        <h4>Seleccione un vehículo</h4>
        <p>Por favor, seleccione un vehículo de la lista para comenzar el diagnóstico técnico.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiagnosticoTecnico',
  data() {
    return {
      vehiculoSeleccionado: '',
      sistemaAbierto: 'motor',
      sistemas: [
        {
          id: 'motor',
          nombre: 'Motor',
          icono: 'fas fa-cog',
          color: 'bg-red',
          fallas: [
            { id: 'm1', descripcion: 'Fuga de aceite' },
            { id: 'm2', descripcion: 'Sobrecalentamiento' },
            { id: 'm3', descripcion: 'Pérdida de potencia' },
            { id: 'm4', descripcion: 'Ruidos anormales' }
          ]
        },
        {
          id: 'frenos',
          nombre: 'Sistema de Frenos',
          icono: 'fas fa-tachometer-alt',
          color: 'bg-orange',
          fallas: [
            { id: 'f1', descripcion: 'Desgaste de pastillas' },
            { id: 'f2', descripcion: 'Fuga de líquido de frenos' },
            { id: 'f3', descripcion: 'Vibración al frenar' }
          ]
        },
        {
          id: 'suspension',
          nombre: 'Suspensión y Dirección',
          icono: 'fas fa-compass',
          color: 'bg-yellow',
          fallas: [
            { id: 's1', descripcion: 'Amortiguadores desgastados' },
            { id: 's2', descripcion: 'Terminales de dirección' },
            { id: 's3', descripcion: 'Brazos de control' }
          ]
        },
        {
          id: 'electrico',
          nombre: 'Sistema Eléctrico',
          icono: 'fas fa-bolt',
          color: 'bg-olive',
          fallas: [
            { id: 'e1', descripcion: 'Problemas de batería' },
            { id: 'e2', descripcion: 'Alternador defectuoso' },
            { id: 'e3', descripcion: 'Cortocircuitos' }
          ]
        }
      ],
      diagnosticoActual: {
        motor: { estado: 'optimo', fallas: [], observaciones: '' },
        frenos: { estado: 'optimo', nivelDesgaste: 'medio', fallas: [], observaciones: '' },
        suspension: { estado: 'optimo', fallas: [], observaciones: '' },
        electrico: { estado: 'optimo', fallas: [], observaciones: '' }
      },
      vehiculosEnTaller: []
    }
  },
  async mounted() {
    await this.cargarVehiculos();
  },
  methods: {
    async cargarVehiculos() {
      try {
        const response = await fetch('http://localhost:3000/api/vehiculos');
        const vehiculos = await response.json();
        this.vehiculosEnTaller = vehiculos.map(v => ({
          id: v.matricula,
          placa: v.matricula,
          marca: v.marca,
          modelo: v.modelo,
          estado: 'en_taller'
        }));
      } catch (error) {
        console.error('Error cargando vehículos:', error);
      }
    },
    toggleSistema(sistemaId) {
      this.sistemaAbierto = this.sistemaAbierto === sistemaId ? null : sistemaId;
    },
    async cargarDiagnostico() {
      if (!this.vehiculoSeleccionado) return;

      try {
        const response = await fetch(`http://localhost:3000/api/diagnosticos?vehiculo=${this.vehiculoSeleccionado}`);
        const diagnosticos = await response.json();

        if (diagnosticos.length > 0) {
          const diagnostico = diagnosticos[0];
          // Aquí podrías mapear el diagnóstico existente a la estructura del componente
          console.log('Diagnóstico existente:', diagnostico);
        }
      } catch (error) {
        console.error('Error cargando diagnóstico:', error);
      }
    },
    async guardarDiagnostico() {
      if (!this.vehiculoSeleccionado) {
        alert('Seleccione un vehículo primero');
        return;
      }

      try {
        const diagnosticoData = {
          id_vehiculo: this.vehiculoSeleccionado,
          fecha_ingreso: new Date().toISOString().split('T')[0],
          descrip_falla: this.generarDescripcionFalla()
        };

        const response = await fetch('http://localhost:3000/api/diagnosticos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(diagnosticoData)
        });

        if (response.ok) {
          alert('✅ Diagnóstico guardado exitosamente');
        } else {
          throw new Error('Error al guardar diagnóstico');
        }
      } catch (error) {
        console.error('Error guardando diagnóstico:', error);
        alert('Error al guardar el diagnóstico');
      }
    },
    generarDescripcionFalla() {
      let descripcion = '';
      Object.keys(this.diagnosticoActual).forEach(sistema => {
        const sist = this.diagnosticoActual[sistema];
        if (sist.estado !== 'optimo' || sist.fallas.length > 0 || sist.observaciones) {
          descripcion += `${this.sistemas.find(s => s.id === sistema).nombre}: ${this.getStatusText(sist.estado)}. `;
          if (sist.fallas.length > 0) {
            descripcion += `Fallas: ${sist.fallas.join(', ')}. `;
          }
          if (sist.observaciones) {
            descripcion += `Observaciones: ${sist.observaciones}. `;
          }
        }
      });
      return descripcion || 'Sin fallas detectadas';
    },
    limpiarDiagnostico() {
      this.diagnosticoActual = {
        motor: { estado: 'optimo', fallas: [], observaciones: '' },
        frenos: { estado: 'optimo', nivelDesgaste: 'medio', fallas: [], observaciones: '' },
        suspension: { estado: 'optimo', fallas: [], observaciones: '' },
        electrico: { estado: 'optimo', fallas: [], observaciones: '' }
      };
    },
    generarReporte() {
      alert('📄 Generando reporte PDF...');
      // Aquí implementarías la generación del PDF
    },
    getStatusClass(estado) {
      const clases = {
        optimo: 'status-optimo',
        leve: 'status-leve',
        moderado: 'status-moderado',
        critico: 'status-critico'
      };
      return clases[estado] || 'status-optimo';
    },
    getStatusText(estado) {
      const textos = {
        optimo: 'Óptimo',
        leve: 'Problemas Leves',
        moderado: 'Problemas Moderados',
        critico: 'Crítico'
      };
      return textos[estado] || 'Óptimo';
    }
  }
}
</script>

<style scoped>
.diagnostico-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header con buen espaciado */
.page-header {
  margin-bottom: 2.5rem;
  padding-top: 1rem;
}

.page-header h2 {
  color: var(--color-dark);
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-header h2 i {
  color: var(--color-orange);
}

.vehicle-selector-card {
  background: var(--color-white);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(48, 35, 37, 0.08);
  margin-bottom: 2rem;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.selector-header {
  background: var(--color-dark);
  color: var(--color-yellow);
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(245, 225, 164, 0.2);
}

.selector-header h5 {
  margin: 0;
  font-weight: 600;
  font-size: 1.1rem;
}

.selector-body {
  padding: 1.5rem;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: var(--color-white);
  width: 100%;
  font-size: 0.95rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-orange);
  box-shadow: 0 0 0 3px rgba(238, 127, 39, 0.1);
}

.accordion-system {
  background: var(--color-white);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(48, 35, 37, 0.08);
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.accordion-item {
  border-bottom: 1px solid #e9ecef;
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--color-white);
}

.accordion-header:hover {
  background: #f8f9fa;
}

.sistema-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.sistema-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.sistema-details {
  flex: 1;
}

.sistema-name {
  color: var(--color-dark);
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  font-size: 1rem;
}

.sistema-status {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.status-optimo {
  background: rgba(217, 213, 147, 0.15);
  color: var(--color-dark);
  border: 1px solid rgba(217, 213, 147, 0.3);
}

.status-leve {
  background: rgba(245, 225, 164, 0.15);
  color: var(--color-dark);
  border: 1px solid rgba(245, 225, 164, 0.3);
}

.status-moderado {
  background: rgba(238, 127, 39, 0.15);
  color: var(--color-orange);
  border: 1px solid rgba(238, 127, 39, 0.3);
}

.status-critico {
  background: rgba(188, 22, 42, 0.15);
  color: var(--color-red);
  border: 1px solid rgba(188, 22, 42, 0.3);
}

.accordion-arrow {
  color: var(--color-orange);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.accordion-arrow .rotated {
  transform: rotate(180deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: #fafafa;
}

.accordion-content.open {
  max-height: 800px;
}

.sistema-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.fallas-section {
  margin-bottom: 1.5rem;
}

.fallas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.falla-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.falla-item:hover {
  background: var(--color-yellow);
  border-color: rgba(245, 225, 164, 0.5);
}

.falla-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-orange);
  flex-shrink: 0;
}

.falla-item label {
  cursor: pointer;
  font-weight: 500;
  color: var(--color-dark);
  font-size: 0.9rem;
  flex: 1;
}

.diagnostico-actions {
  padding: 1.5rem;
  background: #f8f9fa;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-orange {
  background: var(--color-orange);
  color: white;
}

.btn-orange:hover {
  background: #d96a20;
  transform: translateY(-1px);
}

.btn-red {
  background: var(--color-red);
  color: white;
}

.btn-red:hover {
  background: #a01223;
  transform: translateY(-1px);
}

.no-vehicle-message {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--color-white);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(48, 35, 37, 0.08);
  border: 1px solid #e9ecef;
}

.message-icon {
  font-size: 3rem;
  color: var(--color-orange);
  margin-bottom: 1rem;
  opacity: 0.7;
}

.no-vehicle-message h4 {
  color: var(--color-dark);
  margin-bottom: 1rem;
  font-weight: 600;
}

.no-vehicle-message p {
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .diagnostico-container {
    padding: 0 0.5rem;
  }
  
  .page-header {
    margin-bottom: 2rem;
  }
  
  .page-header h2 {
    font-size: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .diagnostico-actions {
    flex-direction: column;
  }
  
  .fallas-grid {
    grid-template-columns: 1fr;
  }
  
  .sistema-info {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .accordion-header {
    padding: 1rem 1.25rem;
  }
  
  .sistema-form {
    padding: 1.25rem;
  }
}
</style>