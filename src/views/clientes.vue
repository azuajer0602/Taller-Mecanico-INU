<script setup>
import Side from '../components/SidebarComponent.vue';
</script>

<template>
  <div class="dashboard-container">
    <Side class="sidebar-fixed"/>
    
    <div class="main-content">
      <header class="dashboard-header">
        <div class="header-content">
          <div>
            <h1 class="page-title">Gestión de Clientes</h1>
            <p class="page-subtitle">
              <i class="far fa-calendar-alt me-2"></i>{{ currentDate }}
            </p>
          </div>
          
          <div class="user-profile">
            <div class="avatar-circle">
              <i class="fas fa-user-tie"></i>
            </div>
            <div class="user-info d-none d-md-block">
              <span class="user-name">Admin Taller</span>
              <span class="user-role">Gerente</span>
            </div>
          </div>
        </div>
      </header>

      <div class="row g-4 mb-5">
        <div class="col-12 col-md-6">
          <div class="metric-card primary-card">
            <div class="metric-body">
              <div class="metric-value">{{ metricsClientes.total }}</div>
              <div class="metric-label">Clientes Activos</div>
            </div>
            <div class="metric-icon-container bg-primary-soft">
              <i class="fas fa-users text-primary"></i>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="metric-card success-card">
            <div class="metric-body">
              <div class="metric-value text-truncate" style="font-size: 1.5rem;">
                {{ metricsClientes.ultimo }}
              </div>
              <div class="metric-label">Último Registro</div>
            </div>
            <div class="metric-icon-container bg-success-soft">
              <i class="fas fa-user-plus text-success"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="card content-card shadow-sm border-0">
        <div class="card-header bg-white border-0 py-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h5 class="card-title mb-1 fw-bold text-dark">Base de Datos de Clientes</h5>
            <p class="text-muted small mb-0">Administra la información de tus clientes</p>
          </div>
          <button class="btn btn-primary btn-add px-4" @click="abrirModal()">
            <i class="fas fa-plus me-2"></i>Nuevo Cliente
          </button>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table custom-table align-middle mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="ps-4">Cliente</th>
                  <th>Contacto</th>
                  <th>Ubicación</th>
                  <th class="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="cargando">
                  <td colspan="4" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="mt-2 text-muted">Cargando datos...</p>
                  </td>
                </tr>

                <tr v-else v-for="cliente in clientes" :key="cliente.id_cliente" class="hover-row">
                  <td class="ps-4">
                    <div class="d-flex align-items-center">
                      <div class="client-avatar-small me-3">
                        {{ cliente.nombre.charAt(0) }}{{ cliente.apellido.charAt(0) }}
                      </div>
                      <div>
                        <h6 class="mb-0 fw-bold text-dark">{{ cliente.nombre }} {{ cliente.apellido }}</h6>
                        <small class="text-muted">C.I: {{ cliente.cedula }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-column">
                      <span class="mb-1"><i class="fas fa-envelope text-primary me-2"></i>{{ cliente.correo }}</span>
                      <small class="text-muted"><i class="fas fa-phone me-2"></i>{{ cliente.telefono || 'Sin teléfono' }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="d-inline-block text-truncate" style="max-width: 200px;">
                      <i class="fas fa-map-marker-alt text-danger me-2"></i>{{ cliente.direccion || 'Sin dirección' }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <button class="btn btn-icon btn-light text-info me-2" @click="verDetalle(cliente)" title="Ver Detalle">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon btn-light text-warning me-2" @click="editarCliente(cliente)" title="Editar">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn btn-icon btn-light text-danger" @click="eliminarCliente(cliente.id_cliente)" title="Eliminar">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>

                <tr v-if="!cargando && clientes.length === 0">
                  <td colspan="4" class="text-center py-5">
                    <div class="empty-state">
                      <i class="fas fa-folder-open mb-3"></i>
                      <h5>No hay clientes registrados</h5>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-backdrop fade show"></div>
    <div v-if="mostrarModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-primary text-white py-3">
            <h5 class="modal-title fw-bold">
              <i class="fas" :class="modoEdicion ? 'fa-user-edit' : 'fa-user-plus'"></i>
              {{ modoEdicion ? ' Editar Cliente' : ' Nuevo Cliente' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="cerrarModal"></button>
          </div>
          
          <div class="modal-body p-4">
            <form @submit.prevent="guardarCliente">
              <h6 class="text-primary fw-bold mb-3 border-bottom pb-2">Información Personal</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-4">
                  <label class="form-label small text-muted fw-bold">Cédula *</label>
                  <input v-model="formulario.cedula" type="text" class="form-control bg-light" placeholder="Ej: V-123456" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label small text-muted fw-bold">Nombre *</label>
                  <input v-model="formulario.nombre" type="text" class="form-control bg-light" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label small text-muted fw-bold">Apellido *</label>
                  <input v-model="formulario.apellido" type="text" class="form-control bg-light" required>
                </div>
              </div>

              <h6 class="text-primary fw-bold mb-3 border-bottom pb-2">Datos de Contacto</h6>
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label small text-muted fw-bold">Correo Electrónico *</label>
                  <div class="input-group">
                    <span class="input-group-text bg-white border-end-0"><i class="fas fa-envelope text-muted"></i></span>
                    <input v-model="formulario.correo" type="email" class="form-control bg-light border-start-0" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label small text-muted fw-bold">Teléfono</label>
                  <div class="input-group">
                    <span class="input-group-text bg-white border-end-0"><i class="fas fa-phone text-muted"></i></span>
                    <input v-model="formulario.telefono" type="text" class="form-control bg-light border-start-0">
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small text-muted fw-bold">Dirección</label>
                <textarea v-model="formulario.direccion" class="form-control bg-light" rows="3"></textarea>
              </div>

              <div class="modal-footer px-0 pb-0 pt-3 border-0">
                <button type="button" class="btn btn-light px-4" @click="cerrarModal">Cancelar</button>
                <button type="submit" class="btn btn-primary px-4 shadow-sm">
                  {{ modoEdicion ? 'Guardar Cambios' : 'Registrar Cliente' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalDetalle" class="modal-backdrop fade show" style="z-index: 1055;"></div>
    <div v-if="mostrarModalDetalle" class="modal fade show d-block" tabindex="-1" style="z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-id-card me-2"></i>Ficha de Cliente</h5>
            <button type="button" class="btn-close btn-close-white" @click="cerrarModalDetalle"></button>
          </div>
          <div class="modal-body p-0">
             <div class="text-center bg-light py-4">
                 <div class="avatar-large mx-auto mb-3 shadow-sm">
                     {{ clienteSeleccionado.nombre.charAt(0) }}{{ clienteSeleccionado.apellido.charAt(0) }}
                 </div>
                 <h4 class="fw-bold text-dark mb-0">{{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido }}</h4>
                 <span class="badge bg-primary rounded-pill mt-2">Cedula: {{ clienteSeleccionado.cedula }}</span>
             </div>
             <div class="p-4">
                 <div class="row g-3">
                     <div class="col-12 p-3 border rounded bg-white">
                         <label class="small text-muted fw-bold d-block">Correo Electrónico</label>
                         <span class="fs-6"><i class="fas fa-envelope text-info me-2"></i>{{ clienteSeleccionado.correo }}</span>
                     </div>
                     <div class="col-12 p-3 border rounded bg-white">
                         <label class="small text-muted fw-bold d-block">Teléfono</label>
                         <span class="fs-6"><i class="fas fa-phone text-success me-2"></i>{{ clienteSeleccionado.telefono || 'No registrado' }}</span>
                     </div>
                     <div class="col-12 p-3 border rounded bg-white">
                         <label class="small text-muted fw-bold d-block">Dirección</label>
                         <span class="fs-6"><i class="fas fa-map-marker-alt text-danger me-2"></i>{{ clienteSeleccionado.direccion || 'No registrada' }}</span>
                     </div>
                 </div>
             </div>
          </div>
          <div class="modal-footer bg-light border-0">
            <button type="button" class="btn btn-secondary w-100" @click="cerrarModalDetalle">Cerrar Ficha</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'ClientesView',
  data() {
    return {
      apiUrl: 'http://127.0.0.1:3000/api/clientes', 
      
      cargando: false,
      clientes: [],
      
      // Control Modales
      mostrarModal: false,
      mostrarModalDetalle: false, // Nuevo estado para el modal de detalle
      modoEdicion: false,
      
      clienteSeleccionado: {}, // Para guardar el cliente que se ve en detalle

      formulario: {
        id_cliente: null,
        cedula: '',
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        direccion: ''
      },

      currentDate: new Date().toLocaleDateString('es-VE', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }),
    }
  },
  computed: {
    metricsClientes() {
      if (!this.clientes.length) return { total: 0, ultimo: 'N/A' };
      const ultimo = this.clientes[0];
      return {
        total: this.clientes.length,
        ultimo: ultimo ? `${ultimo.nombre} ${ultimo.apellido}` : 'N/A'
      }
    }
  },
  mounted() {
    this.cargarEstilosExternos();
    this.obtenerClientes();
  },
  methods: {
    cargarEstilosExternos() {
      // Usamos una CDN muy estable para asegurar que los iconos carguen
      if (!document.getElementById('fa-css')) {
        const faLink = document.createElement('link')
        faLink.id = 'fa-css'
        faLink.rel = 'stylesheet'
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        document.head.appendChild(faLink)
      }
      if (!document.getElementById('bs-css')) {
        const bsLink = document.createElement('link')
        bsLink.id = 'bs-css'
        bsLink.rel = 'stylesheet'
        bsLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css'
        document.head.appendChild(bsLink)
      }
      if (!document.getElementById('font-css')) {
        const fontLink = document.createElement('link')
        fontLink.id = 'font-css'
        fontLink.rel = 'stylesheet'
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
        document.head.appendChild(fontLink)
      }
    },

    async obtenerClientes() {
        this.cargando = true;
        try {
            const respuesta = await fetch(this.apiUrl);
            if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);
            const datos = await respuesta.json();

            if (datos.data && datos.data.clientes) {
                this.clientes = datos.data.clientes;
            } else if (Array.isArray(datos.data)) {
                 this.clientes = datos.data;
            } else if (datos.body && datos.body.clientes) {
                this.clientes = datos.body.clientes;
            } else {
                this.clientes = [];
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            this.cargando = false;
        }
    },

    async guardarCliente() {
        try {
            const method = this.modoEdicion ? 'PUT' : 'POST';
            const url = this.modoEdicion 
                ? `${this.apiUrl}/${this.formulario.id_cliente}` 
                : `${this.apiUrl}`;

            const respuesta = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.formulario)
            });

            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                const msg = resultado.message || (resultado.data ? resultado.data : 'Error al guardar');
                alert(msg);
                return;
            }

            await this.obtenerClientes(); 
            this.cerrarModal();
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    },

    async eliminarCliente(id) {
        if(!confirm('¿Estás seguro de eliminar este cliente?')) return;
        try {
            const respuesta = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });
            if (!respuesta.ok) {
                alert('No se pudo eliminar el cliente');
                return;
            }
            this.obtenerClientes(); 
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    // --- MANEJO DE MODALES ---
    
    abrirModal() {
        this.modoEdicion = false;
        this.limpiarFormulario();
        this.mostrarModal = true;
    },
    editarCliente(cliente) {
        this.modoEdicion = true;
        this.formulario = { ...cliente }; 
        this.mostrarModal = true;
    },
    cerrarModal() {
        this.mostrarModal = false;
        this.limpiarFormulario();
    },
    
    // Funciones para el nuevo modal de Detalle
    verDetalle(cliente) {
        this.clienteSeleccionado = { ...cliente };
        this.mostrarModalDetalle = true;
    },
    cerrarModalDetalle() {
        this.mostrarModalDetalle = false;
        this.clienteSeleccionado = {};
    },

    limpiarFormulario() {
        this.formulario = { id_cliente: null, cedula: '', nombre: '', apellido: '', correo: '', telefono: '', direccion: '' };
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f3f6f9;
  font-family: 'Poppins', sans-serif;
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-left: 250px;
  transition: all 0.3s ease;
}

/* Header */
.dashboard-header {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title { font-size: 1.5rem; font-weight: 700; color: #2c3e50; margin: 0; }
.page-subtitle { color: #95a5a6; font-size: 0.9rem; margin-top: 5px; }

/* Perfil */
.user-profile {
  display: flex; align-items: center; gap: 15px;
  padding: 8px 15px; background: #f8f9fa; border-radius: 50px;
}
.avatar-circle {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}
.user-name { font-weight: 600; font-size: 0.9rem; color: #2c3e50; }
.user-role { font-size: 0.75rem; color: #95a5a6; }

/* Tarjetas Métricas - ARREGLADO ICONOS */
.metric-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
  height: 100%;
  border-left: 5px solid transparent;
}

.primary-card { border-left-color: #4e73df; }
.success-card { border-left-color: #1cc88a; }

.metric-value { font-size: 2rem; font-weight: 700; color: #2c3e50; line-height: 1.2; }
.metric-label { color: #858796; font-size: 0.9rem; margin-top: 5px; font-weight: 500; }

/* Contenedor del icono corregido para que se vea */
.metric-icon-container {
  width: 60px; height: 60px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
}
.bg-primary-soft { background-color: rgba(78, 115, 223, 0.1); }
.bg-success-soft { background-color: rgba(28, 200, 138, 0.1); }

/* Tabla */
.content-card { border-radius: 16px; overflow: hidden; }
.custom-table th {
  font-weight: 600; text-transform: uppercase; font-size: 0.75rem;
  color: #858796; padding: 1rem;
}
.custom-table td { padding: 1rem; border-bottom: 1px solid #f0f2f5; }
.hover-row:hover { background-color: #f8f9fc; }

.client-avatar-small {
  width: 35px; height: 35px; background-color: #e2e6ea;
  color: #6c757d; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.8rem;
}

.avatar-large {
  width: 80px; height: 80px; background-color: #e2e6ea;
  color: #4e73df; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 2rem;
}

.btn-icon {
  width: 32px; height: 32px; padding: 0;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: all 0.2s;
}
.btn-icon:hover { transform: scale(1.1); }

.modal-content { border-radius: 20px; border: none; }
.form-control { border-radius: 10px; border: 1px solid #e3e6f0; }

/* Responsive */
@media (max-width: 992px) {
  .main-content { margin-left: 0; padding: 1.5rem; }
  .dashboard-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
  .header-content { width: 100%; }
}

@media (max-width: 768px) {
  .metric-card { margin-bottom: 1rem; }
  /* Tabla tarjeta */
  .custom-table thead { display: none; }
  .custom-table, .custom-table tbody, .custom-table tr, .custom-table td {
    display: block; width: 100%;
  }
  .custom-table tr {
    margin-bottom: 1rem; background: white;
    border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    padding: 1rem; border: 1px solid #e3e6f0;
  }
  .custom-table td { padding: 0.5rem 0; text-align: left; border: none; }
  .custom-table td.text-end {
    text-align: right; margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f2f5;
  }
}
</style>