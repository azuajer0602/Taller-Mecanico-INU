<template>
 

    <!-- Contenido Principal -->
    <div class="main-content">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-left">
          <h1>Taller Mecánico - Dashboard</h1>
          <p>Bienvenido de nuevo, hoy es {{ currentDate }}</p>
        </div>
        <div class="header-right">
          <div class="user-profile">
            <img src="https://via.placeholder.com/40x40/007bff/ffffff?text=M" alt="Mecánico" class="user-avatar">
            <span>Jefe de Taller</span>
          </div>
        </div>
      </header>

      <!-- Métricas Principales -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="metric-card">
            <div class="metric-icon" style="background-color: #28a745;">
              <i class="fas fa-car"></i>
            </div>
            <div class="metric-info">
              <h3>Vehículos Reparados</h3>
              <p class="metric-value">{{ metrics.vehiculosReparados }}</p>
              <p class="metric-change positive">+{{ metrics.vehiculosEsteMes }} este mes</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card">
            <div class="metric-icon" style="background-color: #007bff;">
              <i class="fas fa-users"></i>
            </div>
            <div class="metric-info">
              <h3>Mecánicos</h3>
              <p class="metric-value">{{ metrics.mecanicos }}</p>
              <p class="metric-change">{{ metrics.mecanicosActivos }} activos</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card">
            <div class="metric-icon" style="background-color: #ffc107;">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="metric-info">
              <h3>Ingresos del Mes</h3>
              <p class="metric-value">${{ metrics.ingresosMes.toLocaleString() }}</p>
              <p class="metric-change positive">+{{ ((metrics.ingresosMes - metrics.ingresosMesAnterior) / metrics.ingresosMesAnterior * 100).toFixed(1) }}%</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card">
            <div class="metric-icon" style="background-color: #dc3545;">
              <i class="fas fa-tools"></i>
            </div>
            <div class="metric-info">
              <h3>Servicios Activos</h3>
              <p class="metric-value">{{ metrics.serviciosActivos }}</p>
              <p class="metric-change">En progreso</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido Principal sin Scroll -->
      <div class="row g-3">
        <!-- Vehículos Recientes -->
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">
                <i class="fas fa-car me-2"></i>Vehículos Recientes
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <div v-for="vehiculo in vehiculosRecientes" :key="vehiculo.id" 
                     class="list-group-item list-group-item-action">
                  <div class="d-flex w-100 justify-content-between align-items-center">
                    <div>
                      <h6 class="mb-1">{{ vehiculo.marca }} {{ vehiculo.modelo }}</h6>
                      <p class="mb-1 text-muted small">
                        <strong>Placa:</strong> {{ vehiculo.placa }} | 
                        <strong>Cliente:</strong> {{ vehiculo.cliente }}
                      </p>
                      <span class="badge" :class="{
                        'bg-warning': vehiculo.estado === 'En reparación',
                        'bg-success': vehiculo.estado === 'Completado',
                        'bg-info': vehiculo.estado === 'Diagnóstico'
                      }">
                        {{ vehiculo.estado }}
                      </span>
                    </div>
                    <div class="text-end">
                      <small class="text-muted">{{ vehiculo.fechaEntrada }}</small>
                      <div class="mt-1">
                        <strong class="text-primary">${{ vehiculo.costo.toLocaleString() }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Servicios Recientes -->
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header bg-success text-white">
              <h5 class="card-title mb-0">
                <i class="fas fa-tools me-2"></i>Servicios Recientes
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <div v-for="servicio in serviciosRecientes" :key="servicio.id" 
                     class="list-group-item list-group-item-action">
                  <div class="d-flex w-100 justify-content-between align-items-center">
                    <div>
                      <h6 class="mb-1">{{ servicio.tipo }}</h6>
                      <p class="mb-1 text-muted small">
                        <strong>Vehículo:</strong> {{ servicio.vehiculo }} | 
                        <strong>Mecánico:</strong> {{ servicio.mecanico }}
                      </p>
                      <span class="badge" :class="{
                        'bg-secondary': servicio.prioridad === 'Baja',
                        'bg-warning': servicio.prioridad === 'Media',
                        'bg-danger': servicio.prioridad === 'Alta'
                      }">
                        {{ servicio.prioridad }}
                      </span>
                    </div>
                    <div class="text-end">
                      <small class="text-muted">{{ servicio.fecha }}</small>
                      <div class="mt-1">
                        <strong class="text-success">${{ servicio.costo.toLocaleString() }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ingresos Recientes -->
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-warning text-dark">
              <h5 class="card-title mb-0">
                <i class="fas fa-money-bill-wave me-2"></i>Últimos Ingresos
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Vehículo</th>
                      <th>Servicio</th>
                      <th>Mecánico</th>
                      <th class="text-end">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ingreso in ingresosRecientes" :key="ingreso.id">
                      <td>{{ ingreso.fecha }}</td>
                      <td>{{ ingreso.cliente }}</td>
                      <td>{{ ingreso.vehiculo }}</td>
                      <td>{{ ingreso.servicio }}</td>
                      <td>
                        <span class="badge bg-info">{{ ingreso.mecanico }}</span>
                      </td>
                      <td class="text-end">
                        <strong class="text-success">${{ ingreso.monto.toLocaleString() }}</strong>
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
  name: 'DashboardMecanico',
  data() {
    return {
      currentDate: new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      
      // Base de datos simulada
      metrics: {
        vehiculosReparados: 156,
        vehiculosEsteMes: 23,
        mecanicos: 8,
        mecanicosActivos: 6,
        ingresosMes: 452800,
        ingresosMesAnterior: 385000,
        serviciosActivos: 12
      },
      
      vehiculosRecientes: [
        {
          id: 1,
          marca: 'Toyota',
          modelo: 'Hilux',
          placa: 'ABC-123',
          cliente: 'Juan Pérez',
          estado: 'En reparación',
          fechaEntrada: 'Hoy 08:30',
          costo: 85000
        },
        {
          id: 2,
          marca: 'Ford',
          modelo: 'Ranger',
          placa: 'DEF-456',
          cliente: 'María García',
          estado: 'Diagnóstico',
          fechaEntrada: 'Ayer 14:20',
          costo: 45000
        },
        {
          id: 3,
          marca: 'Chevrolet',
          modelo: 'S10',
          placa: 'GHI-789',
          cliente: 'Carlos López',
          estado: 'Completado',
          fechaEntrada: '15/03/2024',
          costo: 120000
        },
        {
          id: 4,
          marca: 'Nissan',
          modelo: 'Frontier',
          placa: 'JKL-012',
          cliente: 'Ana Martínez',
          estado: 'En reparación',
          fechaEntrada: '14/03/2024',
          costo: 75000
        }
      ],
      
      serviciosRecientes: [
        {
          id: 1,
          tipo: 'Cambio de Aceite y Filtro',
          vehiculo: 'Toyota Hilux',
          mecanico: 'Roberto Díaz',
          prioridad: 'Media',
          fecha: 'Hoy 09:00',
          costo: 25000
        },
        {
          id: 2,
          tipo: 'Reparación de Frenos',
          vehiculo: 'Ford Ranger',
          mecanico: 'Laura Mendoza',
          prioridad: 'Alta',
          fecha: 'Ayer 16:30',
          costo: 85000
        },
        {
          id: 3,
          tipo: 'Alineación y Balanceo',
          vehiculo: 'Chevrolet S10',
          mecanico: 'Pedro Sánchez',
          prioridad: 'Baja',
          fecha: '15/03/2024',
          costo: 35000
        },
        {
          id: 4,
          tipo: 'Reparación de Motor',
          vehiculo: 'Nissan Frontier',
          mecanico: 'Miguel Ángel',
          prioridad: 'Alta',
          fecha: '14/03/2024',
          costo: 120000
        }
      ],
      
      ingresosRecientes: [
        {
          id: 1,
          fecha: '15/03/2024',
          cliente: 'Carlos López',
          vehiculo: 'Chevrolet S10',
          servicio: 'Reparación Completa',
          mecanico: 'Roberto Díaz',
          monto: 120000
        },
        {
          id: 2,
          fecha: '14/03/2024',
          cliente: 'Ana Martínez',
          vehiculo: 'Nissan Frontier',
          servicio: 'Mantenimiento General',
          mecanico: 'Laura Mendoza',
          monto: 75000
        },
        {
          id: 3,
          fecha: '13/03/2024',
          cliente: 'José Ramírez',
          vehiculo: 'Toyota Corolla',
          servicio: 'Cambio de Transmisión',
          mecanico: 'Pedro Sánchez',
          monto: 95000
        },
        {
          id: 4,
          fecha: '12/03/2024',
          cliente: 'Marta Solís',
          vehiculo: 'Honda Civic',
          servicio: 'Reparación Eléctrica',
          mecanico: 'Miguel Ángel',
          monto: 68000
        },
        {
          id: 5,
          fecha: '11/03/2024',
          cliente: 'Ricardo Torres',
          vehiculo: 'Mazda CX-5',
          servicio: 'Suspensión',
          mecanico: 'Roberto Díaz',
          monto: 82000
        }
      ]
    }
  },
  mounted() {
    // Agregar Font Awesome para los íconos
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    document.head.appendChild(link)
    
    // Agregar Bootstrap CSS
    const bootstrapCSS = document.createElement('link')
    bootstrapCSS.rel = 'stylesheet'
    bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css'
    document.head.appendChild(bootstrapCSS)
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