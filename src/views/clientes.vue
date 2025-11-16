<script setup>
import Side from '../components/SidebarComponent.vue';
</script>

<template>
  <Side/>
    <div class="main-content">
      <header class="dashboard-header">
        <div class="header-left">
          <h1>Taller Mecánico - Clientes</h1>
          <p>Gestión de la base de datos de clientes, hoy es {{ currentDate }}</p>
        </div>
        <div class="header-right">
          <div class="user-profile">
            <img src="https://via.placeholder.com/40x40/007bff/ffffff?text=M" alt="Mecánico" class="user-avatar">
            <span>Jefe de Taller</span>
          </div>
        </div>
      </header>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="metric-card">
            <div class="metric-icon" style="background-color: #007bff;">
              <i class="fas fa-users"></i>
            </div>
            <div class="metric-info">
              <h3>Clientes Totales</h3>
              <p class="metric-value">{{ metricsClientes.clientesTotales }}</p>
              <p class="metric-change positive">+{{ metricsClientes.clientesNuevosMes }} nuevos este mes</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card">
            <div class="metric-icon" style="background-color: #28a745;">
              <i class="fas fa-car"></i>
            </div>
            <div class="metric-info">
              <h3>Vehículos Registrados</h3>
              <p class="metric-value">{{ metricsClientes.vehiculosRegistrados }}</p>
              <p class="metric-change">{{ metricsClientes.promedioVehiculos }} por cliente</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="metric-card">
            <div class="metric-icon" style="background-color: #ffc107;">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="metric-info">
              <h3>Gasto Promedio por Cliente (Total)</h3>
              <p class="metric-value">${{ metricsClientes.gastoPromedio.toLocaleString() }}</p>
              <p class="metric-change">Top Cliente: {{ metricsClientes.topCliente }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">
                <i class="fas fa-address-book me-2"></i>Listado de Clientes
                <button class="btn btn-sm btn-light float-end">
                  <i class="fas fa-plus me-1"></i> Nuevo Cliente
                </button>
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Nombre Completo</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Vehículos</th>
                      <th>Último Servicio</th>
                      <th class="text-end">Monto Acumulado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cliente in clientes" :key="cliente.id">
                      <td>{{ cliente.id }}</td>
                      <td>
                        <strong>{{ cliente.nombre }}</strong>
                        <span v-if="cliente.vip" class="badge bg-danger ms-2">VIP</span>
                      </td>
                      <td>{{ cliente.telefono }}</td>
                      <td>{{ cliente.email }}</td>
                      <td>{{ cliente.vehiculos.join(', ') }}</td>
                      <td>{{ cliente.ultimoServicio }}</td>
                      <td class="text-end">
                        <strong class="text-primary">${{ cliente.montoAcumulado.toLocaleString() }}</strong>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-info me-2" title="Ver Detalle">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" title="Editar">
                          <i class="fas fa-edit"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
      currentDate: new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      
      // Métricas específicas para Clientes
      metricsClientes: {
        clientesTotales: 85,
        clientesNuevosMes: 7,
        vehiculosRegistrados: 125,
        promedioVehiculos: (125 / 85).toFixed(2),
        gastoPromedio: 55000,
        topCliente: 'Juan Pérez'
      },
      
      // Base de datos simulada de Clientes
      clientes: [
        {
          id: 1,
          nombre: 'Juan Pérez',
          telefono: '+54 9 11 4567-8901',
          email: 'juan.perez@email.com',
          vehiculos: ['Toyota Hilux', 'Mazda CX-5'],
          ultimoServicio: 'Hoy',
          montoAcumulado: 350000,
          vip: true
        },
        {
          id: 2,
          nombre: 'María García',
          telefono: '+54 9 11 1234-5678',
          email: 'maria.garcia@email.com',
          vehiculos: ['Ford Ranger'],
          ultimoServicio: 'Ayer',
          montoAcumulado: 180000,
          vip: false
        },
        {
          id: 3,
          nombre: 'Carlos López',
          telefono: '+54 9 11 9876-5432',
          email: 'carlos.lopez@email.com',
          vehiculos: ['Chevrolet S10', 'Renault Clio'],
          ultimoServicio: '15/03/2024',
          montoAcumulado: 420000,
          vip: true
        },
        {
          id: 4,
          nombre: 'Ana Martínez',
          telefono: '+54 9 11 3333-4444',
          email: 'ana.martinez@email.com',
          vehiculos: ['Nissan Frontier'],
          ultimoServicio: '14/03/2024',
          montoAcumulado: 75000,
          vip: false
        },
        {
          id: 5,
          nombre: 'José Ramírez',
          telefono: '+54 9 11 5555-6666',
          email: 'jose.ramirez@email.com',
          vehiculos: ['Toyota Corolla'],
          ultimoServicio: '13/03/2024',
          montoAcumulado: 210000,
          vip: false
        },
        // Más clientes de ejemplo
        {
          id: 6,
          nombre: 'Marta Solís',
          telefono: '+54 9 11 7777-8888',
          email: 'marta.solis@email.com',
          vehiculos: ['Honda Civic'],
          ultimoServicio: '12/03/2024',
          montoAcumulado: 168000,
          vip: false
        },
      ]
    }
  },
  mounted() {
    // Asegurarse de que los estilos externos estén cargados (copiado de tu componente original)
    const faLink = document.createElement('link')
    faLink.rel = 'stylesheet'
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    document.head.appendChild(faLink)
    
    const bsLink = document.createElement('link')
    bsLink.rel = 'stylesheet'
    bsLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css'
    document.head.appendChild(bsLink)
  }
}
</script>

<style scoped>


#logo-img {
  width: 150px;
  height: 130px;
  margin-left: 50px;
  margin-bottom: 20px;
}

/* Main Content */
.main-content {
  padding: 20px;
  min-height: 100vh;
  margin-left: 250px;
  background-color: #f8f9fa;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px 0;
  border-bottom: 1px solid #dee2e6;
}

.header-left h1 {
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 10px 20px;
  border-radius: 25px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

/* Metric Cards */
.metric-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  height: 100%;
  border: 1px solid #e9ecef;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.metric-info h3 {
  color: #6c757d;
  font-size: 12px;
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  color: #2c3e50;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 5px;
  line-height: 1;
}

.metric-change {
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 0;
}

.metric-change.positive {
  color: #28a745;
}

/* Cards General */
.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-1px);
}

.card-header {
  border-radius: 12px 12px 0 0 !important;
  border: none;
  padding: 15px 20px;
  font-weight: 600;
}

.card-title {
  font-size: 16px;
  margin-bottom: 0;
}

/* List Groups */
.list-group-item {
  border: none;
  border-bottom: 1px solid #e9ecef;
  padding: 15px 20px;
  transition: background-color 0.2s ease;
}

.list-group-item:last-child {
  border-bottom: none;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

/* Table Styles */
.table {
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
  padding: 15px 20px;
}

.table td {
  padding: 15px 20px;
  vertical-align: middle;
  border-color: #e9ecef;
}

/* Badges */
.badge {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
  }
  

  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .user-profile {
    align-self: flex-start;
  }
  
  .metric-card {
    padding: 15px;
  }
  
  .metric-value {
    font-size: 18px;
  }
}

/* Ajustes de altura para evitar scroll */
.main-content {
padding-left: 40px;
  overflow-y: auto;
}



.col-12 .card {
  margin-top: 1rem;
}
</style>