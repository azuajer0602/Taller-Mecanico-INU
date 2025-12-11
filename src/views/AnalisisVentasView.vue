<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE = 'http://localhost:3000/api';

// Referencias a los Canvas
const chartProductosRef = ref(null);
const chartTendenciasRef = ref(null);
const chartClientesRef = ref(null);
const chartMecanicosRef = ref(null); // NUEVO

// Datos
const topProductos = ref([]);
const tendenciaMensual = ref([]);
const topClientes = ref([]);
const datosRRHH = ref([]); // NUEVO

// METAS ESTRATÉGICAS (Hardcoded para comparar)
const META_SERVICIOS_MES = 15; // Objetivo: Cada mecánico debe hacer 10 carros al mes

const cargarDatos = async () => {
  try {
    // 1. Productos
    const resProd = await fetch(`${API_BASE}/reportes/productos`);
    const dataProd = await resProd.json();
    if(dataProd.success) {
        topProductos.value = dataProd.data; 
        crearGraficoProductos(dataProd.data);
    }

    // 2. Tendencias
    const resTrend = await fetch(`${API_BASE}/reportes/tendencias`);
    const dataTrend = await resTrend.json();
    if(dataTrend.success) {
        tendenciaMensual.value = dataTrend.data; 
        crearGraficoTendencias(dataTrend.data);
    }

    // 3. Clientes
    const resCli = await fetch(`${API_BASE}/reportes/clientes`);
    const dataCli = await resCli.json();
    if(dataCli.success) {
        topClientes.value = dataCli.data; 
        crearGraficoClientes(dataCli.data);
    }

    // 4. RRHH Mecánicos (NUEVO)
    const resRRHH = await fetch(`${API_BASE}/reportes/rrhh-mecanicos`);
    const dataRRHH = await resRRHH.json();
    if(dataRRHH.success) {
        datosRRHH.value = dataRRHH.data;
        crearGraficoMecanicos(dataRRHH.data);
    }

  } catch (e) { console.error(e); }
};

// --- GRÁFICOS ---

const crearGraficoProductos = (data) => {
    if (chartProductosRef.value) {
        new Chart(chartProductosRef.value, {
            type: 'bar',
            data: {
                labels: data.map(i => i.descripcion.substring(0, 15) + '...'),
                datasets: [{
                    label: 'Unidades',
                    data: data.map(i => i.total_vendido),
                    backgroundColor: '#3498db',
                    borderRadius: 5
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }
};

const crearGraficoTendencias = (data) => {
    if (chartTendenciasRef.value) {
        new Chart(chartTendenciasRef.value, {
            type: 'line',
            data: {
                labels: data.map(i => i.mes),
                datasets: [{
                    label: 'Ingresos ($)',
                    data: data.map(i => i.total_venta),
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true }
        });
    }
};

const crearGraficoClientes = (data) => {
    if (chartClientesRef.value) {
        new Chart(chartClientesRef.value, {
            type: 'doughnut',
            data: {
                labels: data.map(c => `${c.Cliente.nombre}`),
                datasets: [{
                    data: data.map(c => c.total_comprado),
                    backgroundColor: ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#34495e']
                }]
            },
            options: { responsive: true }
        });
    }
};

// NUEVO GRÁFICO RRHH (Barras Horizontales)
const crearGraficoMecanicos = (data) => {
    if (chartMecanicosRef.value) {
        new Chart(chartMecanicosRef.value, {
            type: 'bar',
            data: {
                labels: data.map(m => m.mecanico),
                datasets: [
                    {
                        label: 'Servicios Completados',
                        data: data.map(m => m.total_servicios),
                        backgroundColor: '#9b59b6',
                        borderRadius: 4
                    }
                ]
            },
            options: { 
                indexAxis: 'y', // Barras horizontales
                responsive: true 
            }
        });
    }
};

// --- PDF COMPLETO (VENTAS + RRHH) ---

const descargarReportePDF = () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-VE');
    let y = 20;

    // --- PÁGINA 1: VENTAS ---
    doc.addImage('/logo.png', 'PNG', 15, 10, 25, 25);
    doc.setFontSize(18); doc.setTextColor(44, 62, 80);
    doc.text('REPORTE INTEGRAL DE GESTIÓN', 110, 25, { align: 'center' });
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Generado el: ${fecha}`, 110, 32, { align: 'center' });
    y = 50;

    // 1. TENDENCIAS
    doc.setFontSize(14); doc.setTextColor(0);
    doc.text('1. Tendencias de Ventas', 14, y); y += 10;
    if(chartTendenciasRef.value) {
        doc.addImage(chartTendenciasRef.value.toDataURL('image/png'), 'PNG', 15, y, 180, 70);
        y += 75;
    }

    // 2. PRODUCTOS
    doc.text('2. Top Productos', 14, y); y += 10;
    autoTable(doc, {
        startY: y,
        head: [['Producto', 'Vendidos', 'Ingreso']],
        body: topProductos.value.map(row => [
            row.descripcion, row.total_vendido, 
            parseFloat(row.ingreso_total).toLocaleString('es-VE', {minimumFractionDigits: 2})
        ]),
        theme: 'grid'
    });
    
    // --- PÁGINA 2: RRHH ---
    doc.addPage();
    y = 20;
    doc.setFontSize(16); doc.setTextColor(44, 62, 80);
    doc.text('ANÁLISIS DE DESEMPEÑO (RRHH)', 14, y);
    y += 15;

    // 3. GRÁFICO MECÁNICOS
    doc.setFontSize(12); doc.setTextColor(0);
    doc.text('3. Productividad por Mecánico', 14, y); y += 10;
    
    if(chartMecanicosRef.value) {
        doc.addImage(chartMecanicosRef.value.toDataURL('image/png'), 'PNG', 15, y, 180, 80);
        y += 90;
    }

    // 4. TABLA DE OBJETIVOS ESTRATÉGICOS
    doc.text('4. Matriz de Cumplimiento de Objetivos', 14, y); y += 5;

    autoTable(doc, {
        startY: y,
        head: [['Mecánico', 'Servicios', 'Meta Mensual', '% Cumplimiento', 'Mano de Obra ($)', 'Promedio Días']],
        body: datosRRHH.value.map(m => [
            m.mecanico,
            m.total_servicios,
            META_SERVICIOS_MES, // Meta Fija
            `${((m.total_servicios / META_SERVICIOS_MES) * 100).toFixed(0)}%`, // Cálculo %
            parseFloat(m.ingreso_generado).toLocaleString('es-VE', {minimumFractionDigits: 2}),
            m.tiempo_promedio + ' días'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [142, 68, 173] }, // Morado
        columnStyles: { 
            3: { fontStyle: 'bold', halign: 'center' },
            4: { halign: 'right' }
        }
    });

    // Paginación
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages} - MecanoSoft`, 105, 290, { align: 'center' });
    }

    doc.save('Reporte_Gestion_Integral.pdf');
};

onMounted(cargarDatos);
</script>

<template>
  <div class="dashboard-container">
    <Side />
    <div class="main-content">
      
      <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="text-primary fw-bold mb-0">
              <i class="fas fa-chart-pie me-2"></i>Tablero de Control
          </h2>
          <button @click="descargarReportePDF" class="btn btn-danger shadow-sm">
              <i class="fas fa-file-pdf me-2"></i>Descargar Informe General
          </button>
      </div>

      <h5 class="text-muted border-bottom pb-2 mb-3">INDICADORES DE VENTA</h5>
      <div class="row g-4 mb-5">
        <div class="col-md-8">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-white fw-bold"><i class="fas fa-chart-line text-success me-2"></i>Tendencias</div>
                <div class="card-body"><canvas ref="chartTendenciasRef" style="max-height: 250px;"></canvas></div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-white fw-bold"><i class="fas fa-box text-primary me-2"></i>Top Productos</div>
                <div class="card-body"><canvas ref="chartProductosRef" style="max-height: 250px;"></canvas></div>
            </div>
        </div>
      </div>

      <h5 class="text-muted border-bottom pb-2 mb-3">DESEMPEÑO DE EQUIPO (RRHH)</h5>
      <div class="row g-4">
        
        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-white fw-bold text-purple">
                    <i class="fas fa-users-cog me-2" style="color: #9b59b6;"></i>Productividad por Mecánico
                </div>
                <div class="card-body">
                    <canvas ref="chartMecanicosRef" style="max-height: 250px;"></canvas>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-white fw-bold">
                    <i class="fas fa-bullseye text-danger me-2"></i>Objetivos Estratégicos
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-striped mb-0 small">
                            <thead class="bg-light">
                                <tr>
                                    <th>Mecánico</th>
                                    <th class="text-center">Meta</th>
                                    <th class="text-center">Real</th>
                                    <th>Progreso</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(m, i) in datosRRHH" :key="i">
                                    <td class="fw-bold">{{ m.mecanico }}</td>
                                    <td class="text-center">{{ META_SERVICIOS_MES }}</td>
                                    <td class="text-center">{{ m.total_servicios }}</td>
                                    <td style="vertical-align: middle;">
                                        <div class="progress" style="height: 15px;">
                                            <div class="progress-bar" 
                                                 :class="(m.total_servicios / META_SERVICIOS_MES) >= 1 ? 'bg-success' : 'bg-warning'"
                                                 role="progressbar" 
                                                 :style="{width: Math.min((m.total_servicios / META_SERVICIOS_MES) * 100, 100) + '%'}">
                                                {{ ((m.total_servicios / META_SERVICIOS_MES) * 100).toFixed(0) }}%
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="datosRRHH.length === 0">
                                    <td colspan="4" class="text-center text-muted">No hay datos de desempeño.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer bg-white small text-muted">
                    * Meta Mensual: 10 Servicios completados por persona.
                </div>
            </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.dashboard-container { display: flex; min-height: 100vh; background-color: #f3f6f9; }
.main-content { flex: 1; padding: 2rem; margin-left: 250px; }
.card { border-radius: 12px; border: none; }
</style>