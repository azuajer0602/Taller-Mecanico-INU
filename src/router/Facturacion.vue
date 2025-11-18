<script setup>
import Side from '../components/SidebarComponent.vue';
</script>

<template>
  <Side/>
    <div class="main-content">
      <header class="dashboard-header">
        <div class="header-left">
          <h1>Taller Mecánico - Facturación</h1>
          <p>Gestión de facturas y cobros, hoy es {{ currentDate }}</p>
        </div>
        <div class="header-right">
          <div class="user-profile">
            <img src="https://via.placeholder.com/40x40/007bff/ffffff?text=A" alt="Admin" class="user-avatar">
            <span>Administrador</span>
          </div>
        </div>
      </header>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="metric-card">
            <div class="metric-icon" style="background-color: #17a2b8;">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div class="metric-info">
              <h3>Facturado este Mes</h3>
              <p class="metric-value">${{ metricsFacturacion.facturadoMes.toLocaleString() }}</p>
              <p class="metric-change positive">+{{ metricsFacturacion.nuevasFacturas }} facturas nuevas</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card">
            <div class="metric-icon" style="background-color: #dc3545;">
              <i class="fas fa-hourglass-half"></i>
            </div>
            <div class="metric-info">
              <h3>Pendiente de Cobro</h3>
              <p class="metric-value">${{ metricsFacturacion.pendienteCobro.toLocaleString() }}</p>
              <p class="metric-change">{{ metricsFacturacion.facturasPendientes }} facturas</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card">
            <div class="metric-icon" style="background-color: #28a745;">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="metric-info">
              <h3>Total Cobrado</h3>
              <p class="metric-value">${{ metricsFacturacion.totalCobrado.toLocaleString() }}</p>
              <p class="metric-change">Mes actual</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card">
            <div class="metric-icon" style="background-color: #ffc107;">
              <i class="fas fa-receipt"></i>
            </div>
            <div class="metric-info">
              <h3>Ticket Promedio</h3>
              <p class="metric-value">${{ metricsFacturacion.ticketPromedio.toLocaleString() }}</p>
              <p class="metric-change">Por factura</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-info text-white">
              <h5 class="card-title mb-0">
                <i class="fas fa-list-alt me-2"></i>Listado de Facturas
                <button class="btn btn-sm btn-light float-end">
                  <i class="fas fa-plus me-1"></i> Nueva Factura
                </button>
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th># Factura</th>
                      <th>Cliente</th>
                      <th>Fecha Emisión</th>
                      <th>Fecha Vencimiento</th>
                      <th>Estado</th>
                      <th class="text-end">Monto</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="factura in facturas" :key="factura.id">
                      <td><strong>{{ factura.id }}</strong></td>
                      <td>{{ factura.cliente }}</td>
                      <td>{{ factura.fechaEmision }}</td>
                      <td>{{ factura.fechaVencimiento }}</td>
                      <td>
                        <span class="badge" :class="{
                          'bg-success': factura.estado === 'Pagada',
                          'bg-warning text-dark': factura.estado === 'Pendiente',
                          'bg-danger': factura.estado === 'Vencida'
                        }">{{ factura.estado }}</span>
                      </td>
                      <td class="text-end">
                        <strong class="text-info">${{ factura.monto.toLocaleString() }}</strong>
                      </td>
                      <td>
                        <button @click="generarPDF(factura)" class="btn btn-sm btn-outline-secondary me-2" title="Ver PDF">
                          <i class="fas fa-file-pdf"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" title="Registrar Pago">
                          <i class="fas fa-money-check-alt"></i>
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

      <!-- Historial de Ingresos -->
      <div class="row g-3 mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-warning text-dark">
              <h5 class="card-title mb-0">
                <i class="fas fa-history me-2"></i>Historial de Ingresos
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
  name: 'FacturacionView',
  data() {
    return {
      currentDate: new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      
      metricsFacturacion: {
        facturadoMes: 285000,
        nuevasFacturas: 5,
        pendienteCobro: 95000,
        facturasPendientes: 2,
        totalCobrado: 190000,
        ticketPromedio: 57000
      },
      
      facturas: [
        {
          id: 'FAC-00125',
          cliente: 'Juan Pérez',
          fechaEmision: '18/04/2024',
          fechaVencimiento: '18/05/2024',
          estado: 'Pagada',
          monto: 350000,
        },
        {
          id: 'FAC-00126',
          cliente: 'María García',
          fechaEmision: '17/04/2024',
          fechaVencimiento: '17/05/2024',
          estado: 'Pendiente',
          monto: 180000,
        },
        {
          id: 'FAC-00127',
          cliente: 'Carlos López',
          fechaEmision: '15/03/2024',
          fechaVencimiento: '15/04/2024',
          estado: 'Vencida',
          monto: 420000,
        },
        {
          id: 'FAC-00128',
          cliente: 'Ana Martínez',
          fechaEmision: '14/03/2024',
          fechaVencimiento: '14/04/2024',
          estado: 'Pagada',
          monto: 75000,
        },
        {
          id: 'FAC-00129',
          cliente: 'José Ramírez',
          fechaEmision: '13/03/2024',
          fechaVencimiento: '13/04/2024',
          estado: 'Pagada',
          monto: 210000,
        },
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
    // Asegurarse de que los estilos externos estén cargados
    const faLink = document.createElement('link')
    faLink.rel = 'stylesheet'
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    document.head.appendChild(faLink)
    
    const bsLink = document.createElement('link')
    bsLink.rel = 'stylesheet'
    bsLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css'
    document.head.appendChild(bsLink)
  },
  methods: {
    generarPDF(factura) {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(22);
      doc.text('Factura Taller Mecánico', 105, 20, { align: 'center' });

      // Información de la factura
      doc.setFontSize(12);
      doc.text(`Factura #: ${factura.id}`, 20, 40);
      doc.text(`Cliente: ${factura.cliente}`, 20, 48);
      doc.text(`Fecha Emisión: ${factura.fechaEmision}`, 20, 56);
      doc.text(`Fecha Vencimiento: ${factura.fechaVencimiento}`, 20, 64);

      // Estado de la factura
      doc.setFontSize(14);
      doc.text('Estado:', 140, 40);
      doc.setTextColor(factura.estado === 'Pagada' ? '#28a745' : (factura.estado === 'Pendiente' ? '#ffc107' : '#dc3545'));
      doc.text(factura.estado, 160, 40);
      doc.setTextColor(0); // Reset color

      // Tabla de detalles (simulada)
      doc.autoTable({
        startY: 80,
        head: [['Descripción', 'Cantidad', 'Precio Unitario', 'Total']],
        body: [
          ['Servicio de Frenos', 1, '150000', '150000'],
          ['Cambio de Aceite', 1, '30000', '30000'],
          // Puedes agregar más items dinámicamente aquí
        ],
      });

      // Total
      doc.setFontSize(16);
      doc.text(`Total a Pagar: $${factura.monto.toLocaleString()}`, 105, doc.autoTable.previous.finalY + 20, { align: 'center' });

      doc.save(`Factura-${factura.id}.pdf`);
    }
  }
}
</script>

<style scoped>
/* Estilos copiados de clientes.vue para consistencia */
.main-content {
  padding: 20px;
  min-height: 100vh;
  margin-left: 250px;
  background-color: #f8f9fa;
}

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
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  color: #6c757d;
  font-size: 14px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  height: 100%;
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
}

.metric-info h3 {
  font-size: 12px;
  text-transform: uppercase;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
}

.metric-change {
  font-size: 11px;
}

.metric-change.positive {
  color: #28a745;
}

.card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-header {
  border-radius: 12px 12px 0 0 !important;
}

.table th, .table td {
  vertical-align: middle;
}

@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
}
</style>