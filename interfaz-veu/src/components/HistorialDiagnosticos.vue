<template>
  <div class="historial-container">
    <div class="page-header">
      <h2><i class="fas fa-history me-2"></i>Historial de Diagnósticos</h2>
    </div>

    <!-- Filtros -->
    <div class="filters-card">
      <div class="filters-header">
        <h5>Filtros de Búsqueda</h5>
      </div>
      <div class="filters-body">
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">Buscar por Placa</label>
            <input type="text" class="form-control" v-model="filtroPlaca" placeholder="Ej: ABC123">
          </div>
          
          <div class="form-group">
            <label class="form-label">Técnico</label>
            <select class="form-control" v-model="filtroTecnico">
              <option value="">Todos los técnicos</option>
              <option v-for="tecnico in tecnicos" :key="tecnico.id" :value="tecnico.id">
                {{ tecnico.nombre }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-control" v-model="filtroEstado">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Fecha Desde</label>
            <input type="date" class="form-control" v-model="filtroFechaDesde">
          </div>
          
          <div class="form-group">
            <label class="form-label">Fecha Hasta</label>
            <input type="date" class="form-control" v-model="filtroFechaHasta">
          </div>
        </div>
        
        <div class="filters-actions">
          <button class="btn btn-secondary" @click="limpiarFiltros">
            <i class="fas fa-eraser me-1"></i>Limpiar Filtros
          </button>
          <button class="btn btn-primary" @click="aplicarFiltros">
            <i class="fas fa-search me-1"></i>Aplicar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Estadísticas Rápidas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-total">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ totalDiagnosticos }}</div>
          <div class="stat-label">Total Diagnósticos</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-pendiente">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ diagnosticosPendientes }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-progreso">
          <i class="fas fa-cog"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ diagnosticosProgreso }}</div>
          <div class="stat-label">En Progreso</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-completado">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ diagnosticosCompletados }}</div>
          <div class="stat-label">Completados</div>
        </div>
      </div>
    </div>

    <!-- Tabla de Historial -->
    <div class="table-card">
      <div class="table-header">
        <h5>Historial de Diagnósticos</h5>
        <div class="table-actions">
          <button class="btn btn-outline" @click="exportarExcel" :disabled="historialFiltrado.length === 0">
            <i class="fas fa-file-excel me-1"></i>Exportar Excel
          </button>
          <button class="btn btn-outline" @click="toggleVista" v-if="historialFiltrado.length > 0">
            <i class="fas" :class="vistaTabla ? 'fa-list' : 'fa-table'"></i>
            {{ vistaTabla ? 'Vista Tarjetas' : 'Vista Tabla' }}
          </button>
        </div>
      </div>
      
      <!-- Vista Tabla -->
      <div v-if="vistaTabla" class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th @click="ordenarPor('fecha')" class="sortable">
                Fecha
                <i class="fas" :class="getSortIcon('fecha')"></i>
              </th>
              <th @click="ordenarPor('vehiculo.placa')" class="sortable">
                Vehículo
                <i class="fas" :class="getSortIcon('vehiculo.placa')"></i>
              </th>
              <th>Cliente</th>
              <th>Técnico</th>
              <th>Falla Principal</th>
              <th @click="ordenarPor('estado')" class="sortable">
                Estado
                <i class="fas" :class="getSortIcon('estado')"></i>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="diagnostico in historialFiltradoOrdenado" :key="diagnostico.id">
              <td class="fecha-cell">
                <div class="fecha">{{ formatFecha(diagnostico.fecha) }}</div>
                <div class="hora">{{ formatHora(diagnostico.fecha) }}</div>
              </td>
              <td class="vehiculo-cell">
                <div class="placa">{{ diagnostico.vehiculo.placa }}</div>
                <div class="marca-modelo">{{ diagnostico.vehiculo.marca }} {{ diagnostico.vehiculo.modelo }}</div>
              </td>
              <td class="cliente-cell">
                <div class="cliente-nombre">{{ diagnostico.cliente.nombre }}</div>
                <div class="cliente-telefono">{{ diagnostico.cliente.telefono }}</div>
              </td>
              <td class="tecnico-cell">
                <div class="tecnico-nombre">{{ diagnostico.tecnico.nombre }}</div>
                <div class="tecnico-especialidad">{{ diagnostico.tecnico.especialidad }}</div>
              </td>
              <td class="falla-cell">
                <span class="falla-texto">{{ diagnostico.fallaPrincipal }}</span>
              </td>
              <td class="estado-cell">
                <span :class="['estado-badge', getEstadoClass(diagnostico.estado)]">
                  {{ getEstadoText(diagnostico.estado) }}
                </span>
              </td>
              <td class="acciones-cell">
                <div class="acciones-group">
                  <button class="btn-accion btn-ver" @click="verDetalles(diagnostico)" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-accion btn-pdf" @click="generarPDF(diagnostico)" title="Generar PDF">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button class="btn-accion btn-editar" @click="editarDiagnostico(diagnostico)" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vista Tarjetas -->
      <div v-else class="cards-container">
        <div class="diagnostico-cards">
          <div v-for="diagnostico in historialFiltradoOrdenado" :key="diagnostico.id" class="diagnostico-card">
            <div class="card-header">
              <div class="card-placa">{{ diagnostico.vehiculo.placa }}</div>
              <span :class="['card-estado', getEstadoClass(diagnostico.estado)]">
                {{ getEstadoText(diagnostico.estado) }}
              </span>
            </div>
            <div class="card-body">
              <div class="card-info">
                <div class="info-item">
                  <i class="fas fa-car"></i>
                  <span>{{ diagnostico.vehiculo.marca }} {{ diagnostico.vehiculo.modelo }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-user"></i>
                  <span>{{ diagnostico.cliente.nombre }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-tools"></i>
                  <span>{{ diagnostico.tecnico.nombre }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatFecha(diagnostico.fecha) }} {{ formatHora(diagnostico.fecha) }}</span>
                </div>
              </div>
              <div class="card-falla">
                <strong>Falla:</strong> {{ diagnostico.fallaPrincipal }}
              </div>
            </div>
            <div class="card-actions">
              <button class="btn btn-sm btn-outline" @click="verDetalles(diagnostico)">
                <i class="fas fa-eye"></i> Detalles
              </button>
              <button class="btn btn-sm btn-outline" @click="generarPDF(diagnostico)">
                <i class="fas fa-file-pdf"></i> PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div class="pagination-container" v-if="totalPaginas > 1">
        <div class="pagination-info">
          Mostrando {{ inicioItem }}-{{ finItem }} de {{ totalItems }} registros
        </div>
        <nav class="pagination">
          <button class="pagination-btn" :disabled="paginaActual === 1" @click="cambiarPagina(paginaActual - 1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <button 
            v-for="pagina in paginasMostradas" 
            :key="pagina"
            class="pagination-btn"
            :class="{ active: pagina === paginaActual }"
            @click="cambiarPagina(pagina)"
          >
            {{ pagina }}
          </button>
          
          <button class="pagination-btn" :disabled="paginaActual === totalPaginas" @click="cambiarPagina(paginaActual + 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </nav>
      </div>

      <!-- Mensaje cuando no hay resultados -->
      <div v-if="historialFiltrado.length === 0" class="no-results">
        <i class="fas fa-search no-results-icon"></i>
        <h4>No se encontraron resultados</h4>
        <p>Intente ajustar los filtros de búsqueda</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HistorialDiagnosticos',
  data() {
    return {
      filtroPlaca: '',
      filtroTecnico: '',
      filtroEstado: '',
      filtroFechaDesde: '',
      filtroFechaHasta: '',
      paginaActual: 1,
      itemsPorPagina: 10,
      vistaTabla: true,
      ordenCampo: 'fecha',
      ordenDireccion: 'desc',
      diagnosticos: []
    }
  },
  computed: {
    tecnicos() {
      return [
        { id: 1, nombre: 'Carlos López', especialidad: 'Motor' },
        { id: 2, nombre: 'Ana Martínez', especialidad: 'Sistema Eléctrico' },
        { id: 3, nombre: 'Pedro Rodríguez', especialidad: 'Frenos y Suspensión' }
      ]
    },
    historialFiltrado() {
      let filtrado = this.diagnosticos
      
      if (this.filtroPlaca) {
        filtrado = filtrado.filter(d => 
          d.vehiculo.placa.toLowerCase().includes(this.filtroPlaca.toLowerCase())
        )
      }
      
      if (this.filtroTecnico) {
        filtrado = filtrado.filter(d => d.tecnico.id === parseInt(this.filtroTecnico))
      }
      
      if (this.filtroEstado) {
        filtrado = filtrado.filter(d => d.estado === this.filtroEstado)
      }
      
      if (this.filtroFechaDesde) {
        filtrado = filtrado.filter(d => new Date(d.fecha) >= new Date(this.filtroFechaDesde))
      }
      
      if (this.filtroFechaHasta) {
        filtrado = filtrado.filter(d => new Date(d.fecha) <= new Date(this.filtroFechaHasta))
      }
      
      return filtrado
    },
    historialFiltradoOrdenado() {
      const filtrado = [...this.historialFiltrado];
      
      return filtrado.sort((a, b) => {
        let aVal = this.getNestedValue(a, this.ordenCampo);
        let bVal = this.getNestedValue(b, this.ordenCampo);
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return this.ordenDireccion === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.ordenDireccion === 'asc' ? 1 : -1;
        return 0;
      });
    },
    totalDiagnosticos() {
      return this.diagnosticos.length
    },
    diagnosticosPendientes() {
      return this.diagnosticos.filter(d => d.estado === 'pendiente').length
    },
    diagnosticosProgreso() {
      return this.diagnosticos.filter(d => d.estado === 'en_progreso').length
    },
    diagnosticosCompletados() {
      return this.diagnosticos.filter(d => d.estado === 'completado').length
    },
    totalItems() {
      return this.historialFiltrado.length
    },
    totalPaginas() {
      return Math.ceil(this.totalItems / this.itemsPorPagina)
    },
    inicioItem() {
      return (this.paginaActual - 1) * this.itemsPorPagina + 1
    },
    finItem() {
      const fin = this.paginaActual * this.itemsPorPagina
      return fin > this.totalItems ? this.totalItems : fin
    },
    paginasMostradas() {
      const paginas = []
      const inicio = Math.max(1, this.paginaActual - 2)
      const fin = Math.min(this.totalPaginas, inicio + 4)
      
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i)
      }
      return paginas
    }
  },
  methods: {
    aplicarFiltros() {
      this.paginaActual = 1
    },
    limpiarFiltros() {
      this.filtroPlaca = ''
      this.filtroTecnico = ''
      this.filtroEstado = ''
      this.filtroFechaDesde = ''
      this.filtroFechaHasta = ''
      this.paginaActual = 1
    },
    cambiarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas) {
        this.paginaActual = pagina
      }
    },
    ordenarPor(campo) {
      if (this.ordenCampo === campo) {
        this.ordenDireccion = this.ordenDireccion === 'asc' ? 'desc' : 'asc';
      } else {
        this.ordenCampo = campo;
        this.ordenDireccion = 'asc';
      }
    },
    getSortIcon(campo) {
      if (this.ordenCampo !== campo) return 'fa-sort';
      return this.ordenDireccion === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    },
    getNestedValue(obj, path) {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    },
    toggleVista() {
      this.vistaTabla = !this.vistaTabla;
    },
    verDetalles(diagnostico) {
      console.log('Ver detalles:', diagnostico)
      alert(`Mostrando detalles del diagnóstico para ${diagnostico.vehiculo.placa}`)
    },
    generarPDF(diagnostico) {
      console.log('Generar PDF:', diagnostico)
      alert(`Generando PDF para ${diagnostico.vehiculo.placa}`)
    },
    editarDiagnostico(diagnostico) {
      console.log('Editar diagnóstico:', diagnostico)
      alert(`Editando diagnóstico de ${diagnostico.vehiculo.placa}`)
    },
    exportarExcel() {
      alert('Exportando datos a Excel...')
    },
    formatFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-ES')
    },
    formatHora(fecha) {
      return new Date(fecha).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    getEstadoClass(estado) {
      const clases = {
        pendiente: 'estado-pendiente',
        en_progreso: 'estado-progreso',
        completado: 'estado-completado',
        cancelado: 'estado-cancelado'
      }
      return clases[estado] || 'estado-pendiente'
    },
    getEstadoText(estado) {
      const textos = {
        pendiente: 'Pendiente',
        en_progreso: 'En Progreso',
        completado: 'Completado',
        cancelado: 'Cancelado'
      }
      return textos[estado] || 'Pendiente'
    }
  },
  mounted() {
    this.diagnosticos = [
      {
        id: 1,
        fecha: '2024-01-15T09:30:00',
        vehiculo: { placa: 'ABC123', marca: 'Toyota', modelo: 'Corolla' },
        cliente: { nombre: 'Juan Pérez', telefono: '555-0101' },
        tecnico: { id: 1, nombre: 'Carlos López', especialidad: 'Motor' },
        fallaPrincipal: 'Fuga de aceite en motor',
        estado: 'completado'
      },
      {
        id: 2,
        fecha: '2024-01-16T14:20:00',
        vehiculo: { placa: 'XYZ789', marca: 'Honda', modelo: 'Civic' },
        cliente: { nombre: 'María García', telefono: '555-0102' },
        tecnico: { id: 2, nombre: 'Ana Martínez', especialidad: 'Sistema Eléctrico' },
        fallaPrincipal: 'Problemas de alternador',
        estado: 'en_progreso'
      },
      {
        id: 3,
        fecha: '2024-01-17T11:15:00',
        vehiculo: { placa: 'DEF456', marca: 'Ford', modelo: 'Focus' },
        cliente: { nombre: 'Roberto Sánchez', telefono: '555-0103' },
        tecnico: { id: 3, nombre: 'Pedro Rodríguez', especialidad: 'Frenos y Suspensión' },
        fallaPrincipal: 'Desgaste de pastillas de freno',
        estado: 'pendiente'
      }
    ]
  }
}
</script>

<style scoped>
.historial-container {
  max-width: 1400px;
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

.filters-card {
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(48, 35, 37, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.filters-header {
  background: var(--color-dark);
  color: var(--color-yellow);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(245, 225, 164, 0.3);
}

.filters-header h5 {
  margin: 0;
  font-weight: 600;
}

.filters-body {
  padding: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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
}

.form-control {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: var(--color-white);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-orange);
  box-shadow: 0 0 0 2px rgba(238, 127, 39, 0.1);
}

.filters-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-primary {
  background: var(--color-orange);
  color: white;
}

.btn-primary:hover {
  background: #d96a20;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-white);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e9ecef;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-orange);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.stat-total {
  background: var(--color-dark);
}

.stat-pendiente {
  background: var(--color-yellow);
}

.stat-progreso {
  background: var(--color-orange);
}

.stat-completado {
  background: var(--color-olive);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-dark);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.8;
  font-weight: 600;
  color: var(--color-dark);
}

/* Tabla */
.table-card {
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(48, 35, 37, 0.1);
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.table-header {
  padding: 1rem 1.5rem;
  background: var(--color-dark);
  color: var(--color-yellow);
  border-bottom: 1px solid rgba(245, 225, 164, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h5 {
  margin: 0;
  font-weight: 600;
  color: var(--color-yellow);
}

.table-actions {
  display: flex;
  gap: 1rem;
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--color-yellow);
  color: var(--color-yellow);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: var(--color-yellow);
  color: var(--color-dark);
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-responsive {
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th {
  background: #f8f9fa;
  color: var(--color-dark);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.sortable:hover {
  background-color: #e9ecef;
}

.custom-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
  font-size: 0.9rem;
}

.custom-table tr:hover {
  background: #f8f9fa;
}

.fecha-cell .fecha {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 0.9rem;
}

.fecha-cell .hora {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.placa {
  font-weight: 700;
  color: var(--color-dark);
  font-size: 0.95rem;
}

.marca-modelo {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.cliente-nombre {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 0.9rem;
}

.cliente-telefono {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.tecnico-nombre {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 0.9rem;
}

.tecnico-especialidad {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.falla-texto {
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--color-dark);
}

.estado-badge {
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.estado-pendiente {
  background: rgba(245, 225, 164, 0.2);
  color: #856404;
  border: 1px solid rgba(245, 225, 164, 0.3);
}

.estado-progreso {
  background: rgba(238, 127, 39, 0.1);
  color: var(--color-orange);
  border: 1px solid rgba(238, 127, 39, 0.2);
}

.estado-completado {
  background: rgba(217, 213, 147, 0.2);
  color: #4a4a2a;
  border: 1px solid rgba(217, 213, 147, 0.3);
}

.estado-cancelado {
  background: rgba(188, 22, 42, 0.1);
  color: var(--color-red);
  border: 1px solid rgba(188, 22, 42, 0.2);
}

.acciones-group {
  display: flex;
  gap: 0.5rem;
}

.btn-accion {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.btn-ver {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.btn-ver:hover {
  background: #6c757d;
  color: white;
}

.btn-pdf {
  background: rgba(188, 22, 42, 0.1);
  color: var(--color-red);
}

.btn-pdf:hover {
  background: var(--color-red);
  color: white;
}

.btn-editar {
  background: rgba(238, 127, 39, 0.1);
  color: var(--color-orange);
}

.btn-editar:hover {
  background: var(--color-orange);
  color: white;
}

/* Vista Tarjetas */
.cards-container {
  padding: 1.5rem;
}

.diagnostico-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.diagnostico-card {
  background: var(--color-white);
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.diagnostico-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 1rem;
  background: var(--color-yellow);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(245, 225, 164, 0.5);
}

.card-placa {
  font-weight: 700;
  color: var(--color-dark);
  font-size: 1.1rem;
}

.card-estado {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-body {
  padding: 1rem;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.info-item i {
  width: 16px;
  color: var(--color-orange);
}

.card-falla {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  line-height: 1.4;
}

.card-actions {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

/* Paginación */
.pagination-container {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.pagination-info {
  color: #6c757d;
  font-weight: 500;
  font-size: 0.85rem;
}

.pagination {
  display: flex;
  gap: 0.25rem;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: var(--color-dark);
  font-size: 0.85rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.pagination-btn.active {
  background: var(--color-orange);
  border-color: var(--color-orange);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sin resultados */
.no-results {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
}

.no-results-icon {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 1rem;
}

.no-results h4 {
  margin-bottom: 0.5rem;
  color: var(--color-dark);
}

.no-results p {
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-actions {
    flex-direction: column;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .table-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .custom-table {
    font-size: 0.8rem;
  }
  
  .custom-table th,
  .custom-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .diagnostico-cards {
    grid-template-columns: 1fr;
  }
}
</style>