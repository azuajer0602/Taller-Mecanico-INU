<script setup>
import Side from '../components/SidebarComponent.vue'
import { ref, computed, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import Chart from 'chart.js/auto'

// Estado reactivo
const metrics = ref({
  ingresosMes: 125400,
  ingresosMesAnterior: 98500,
  egresosMes: 89400,
  egresosMesAnterior: 75600,
  balanceActual: 36000,
  transaccionesMes: 48,
  cuentasPorCobrar: 23400,
  cuentasPorPagar: 18700
})

const transaccionesRecientes = ref([
  { id: 1, tipo: 'ingreso', descripcion: 'Venta de repuestos', categoria: 'Ventas', monto: 45000, fecha: '2024-03-18', estado: 'completado', referencia: 'FAC-001-2024' },
  { id: 2, tipo: 'egreso', descripcion: 'Compra de herramientas', categoria: 'Inventario', monto: 28000, fecha: '2024-03-18', estado: 'completado', referencia: 'CMP-045-2024' },
  { id: 3, tipo: 'ingreso', descripcion: 'Servicio mecánico premium', categoria: 'Servicios', monto: 35000, fecha: '2024-03-17', estado: 'completado', referencia: 'FAC-098-2024' },
  { id: 4, tipo: 'egreso', descripcion: 'Pago nómina técnicos', categoria: 'Nómina', monto: 42000, fecha: '2024-03-17', estado: 'pendiente', referencia: 'NOM-032-2024' }
])

const cuentasPorCobrar = ref([
  { id: 1, cliente: 'Transportes López Hermanos', descripcion: 'Reparación motor diesel', monto: 12500, fechaVencimiento: '20/03/2024', estado: 'pendiente', diasVencimiento: 2 },
  { id: 2, cliente: 'Taller El Rápido', descripcion: 'Venta de repuestos', monto: 8900, fechaVencimiento: '15/03/2024', estado: 'vencido', diasVencimiento: -3 }
])

const cuentasPorPagar = ref([
  { id: 1, proveedor: 'Distribuidora de Autopartes', descripcion: 'Compra de filtros y aceites', monto: 15600, fechaVencimiento: '25/03/2024', estado: 'pendiente', diasVencimiento: 7 },
  { id: 2, proveedor: 'Servicios Eléctricos SA', descripcion: 'Mantenimiento instalaciones', monto: 3100, fechaVencimiento: '18/03/2024', estado: 'hoy', diasVencimiento: 0 }
])

// Computed
const crecimientoIngresos = computed(() => 
  ((metrics.value.ingresosMes - metrics.value.ingresosMesAnterior) / metrics.value.ingresosMesAnterior * 100).toFixed(1)
)
const crecimientoEgresos = computed(() => 
  ((metrics.value.egresosMes - metrics.value.egresosMesAnterior) / metrics.value.egresosMesAnterior * 100).toFixed(1)
)
const balanceMensual = computed(() => metrics.value.ingresosMes - metrics.value.egresosMes)

// Gráficos principales
let chartFlujo = null
let chartCategorias = null

// Canvas para PDF
const chartFlujoPDF = ref(null)
const chartCategoriasPDF = ref(null)

const inicializarGraficos = () => {
  const ctxFlujo = document.getElementById('chartFlujo')
  const ctxCategorias = document.getElementById('chartCategorias')
  
  if (chartFlujo) chartFlujo.destroy()
  if (chartCategorias) chartCategorias.destroy()
  
  // Gráfico de flujo de caja
  chartFlujo = new Chart(ctxFlujo, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        { label: 'Ingresos', data: [85000, 92000, 98500, 112000, 108500, 125400], borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.1)', tension: 0.4, fill: true, borderWidth: 3 },
        { label: 'Egresos', data: [72000, 68000, 75600, 82000, 79100, 89400], borderColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.1)', tension: 0.4, fill: true, borderWidth: 3 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true, ticks: { callback: value => '$' + value.toLocaleString() } } }
    }
  })
  
  // Gráfico de categorías para la web
  chartCategorias = new Chart(ctxCategorias, {
    type: 'doughnut',
    data: {
      labels: ['Ventas', 'Servicios', 'Nómina', 'Inventario', 'Gastos'],
      datasets: [{ data: [45, 30, 15, 8, 2], backgroundColor: ['#28a745','#007bff','#ffc107','#6f42c1','#dc3545'], borderWidth: 2, borderColor: '#ffffff' }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  })
}

// Función para verificar espacio en la página antes de agregar elementos grandes
const verificarEspacio = (doc, yActual, altoNecesario, margenInferior = 20) => {
  if (yActual + altoNecesario + margenInferior > doc.internal.pageSize.height) {
    doc.addPage()
    return 20 // reinicia posición
  }
  return yActual
}

// Función para crear gráfico de torta PDF
const crearGraficoTortaPDF = async () => {
  return new Promise(resolve => {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 600
    tempCanvas.height = 400
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.fillStyle = '#ffffff'
    tempCtx.fillRect(0,0,tempCanvas.width,tempCanvas.height)

    const data = [45,30,15,8,2]
    const labels = ['Ventas','Servicios','Nómina','Inventario','Gastos']
    const colors = ['#28a745','#007bff','#ffc107','#6f42c1','#dc3545']
    const total = data.reduce((a,b)=>a+b,0)
    const centerX = tempCanvas.width/2
    const centerY = tempCanvas.height/2
    const radius = Math.min(centerX, centerY)*0.6
    const innerRadius = radius*0.6
    let startAngle = 0

    data.forEach((value,index)=>{
      const sliceAngle = (2*Math.PI*value)/total
      // segmento exterior
      tempCtx.beginPath()
      tempCtx.moveTo(centerX,centerY)
      tempCtx.arc(centerX,centerY,radius,startAngle,startAngle+sliceAngle)
      tempCtx.closePath()
      tempCtx.fillStyle = colors[index]
      tempCtx.fill()
      // segmento interior (dona)
      tempCtx.beginPath()
      tempCtx.moveTo(centerX,centerY)
      tempCtx.arc(centerX,centerY,innerRadius,startAngle,startAngle+sliceAngle)
      tempCtx.closePath()
      tempCtx.fillStyle = '#ffffff'
      tempCtx.fill()
      // borde
      tempCtx.beginPath()
      tempCtx.arc(centerX,centerY,radius,startAngle,startAngle+sliceAngle)
      tempCtx.arc(centerX,centerY,innerRadius,startAngle+sliceAngle,startAngle,true)
      tempCtx.closePath()
      tempCtx.strokeStyle = '#ffffff'
      tempCtx.lineWidth = 2
      tempCtx.stroke()
      // porcentaje
      const labelAngle = startAngle+sliceAngle/2
      const labelRadius = radius*0.8
      const labelX = centerX+Math.cos(labelAngle)*labelRadius
      const labelY = centerY+Math.sin(labelAngle)*labelRadius
      const percentage = Math.round((value/total)*100)
      tempCtx.fillStyle = '#2c3e50'
      tempCtx.font = 'bold 14px Arial'
      tempCtx.textAlign = 'center'
      tempCtx.textBaseline = 'middle'
      tempCtx.fillText(`${percentage}%`,labelX,labelY)
      startAngle+=sliceAngle
    })

    // leyenda
    const legendX=20
    let legendY=tempCanvas.height-100
    const legendItemHeight=20
    const legendColorSize=12
    const legendSpacing=5
    tempCtx.font='12px Arial'
    tempCtx.textAlign='left'
    tempCtx.textBaseline='middle'
    labels.forEach((label,index)=>{
      const percentage=Math.round((data[index]/total)*100)
      tempCtx.fillStyle=colors[index]
      tempCtx.fillRect(legendX,legendY,legendColorSize,legendColorSize)
      tempCtx.strokeStyle='#cccccc'
      tempCtx.lineWidth=1
      tempCtx.strokeRect(legendX,legendY,legendColorSize,legendColorSize)
      tempCtx.fillStyle='#2c3e50'
      tempCtx.fillText(`${label} (${percentage}%)`,legendX+legendColorSize+legendSpacing,legendY+legendColorSize/2)
      legendY+=legendItemHeight
    })
    tempCtx.fillStyle='#2c3e50'
    tempCtx.font='bold 16px Arial'
    tempCtx.textAlign='center'
    tempCtx.fillText('DISTRIBUCIÓN DE INGRESOS',centerX,30)
    resolve(tempCanvas.toDataURL('image/png',1.0))
  })
}

// Función para crear gráfico de líneas PDF
const crearGraficoLineasPDF = async () => {
  return new Promise(resolve => {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width=800
    tempCanvas.height=400
    const tempCtx=tempCanvas.getContext('2d')
    tempCtx.fillStyle='#ffffff'
    tempCtx.fillRect(0,0,tempCanvas.width,tempCanvas.height)

    const labels=['Ene','Feb','Mar','Abr','May','Jun']
    const ingresos=[85000,92000,98500,112000,108500,125400]
    const egresos=[72000,68000,75600,82000,79100,89400]
    const margin={top:60,right:40,bottom:60,left:70}
    const width=tempCanvas.width-margin.left-margin.right
    const height=tempCanvas.height-margin.top-margin.bottom
    const maxValue=Math.max(...ingresos,...egresos)
    const xScale=width/(labels.length-1)
    const yScale=height/maxValue

    // ejes
    tempCtx.strokeStyle='#cccccc'
    tempCtx.lineWidth=1
    tempCtx.beginPath()
    tempCtx.moveTo(margin.left,margin.top)
    tempCtx.lineTo(margin.left,margin.top+height)
    tempCtx.stroke()
    tempCtx.beginPath()
    tempCtx.moveTo(margin.left,margin.top+height)
    tempCtx.lineTo(margin.left+width,margin.top+height)
    tempCtx.stroke()

    // cuadrícula horizontal
    tempCtx.strokeStyle='#f0f0f0'
    for(let i=0;i<=5;i++){
      const y=margin.top+height-(i*height/5)
      tempCtx.beginPath()
      tempCtx.moveTo(margin.left,y)
      tempCtx.lineTo(margin.left+width,y)
      tempCtx.stroke()
    }

    // línea ingresos
    tempCtx.strokeStyle='#28a745'
    tempCtx.lineWidth=3
    tempCtx.beginPath()
    ingresos.forEach((value,index)=>{
      const x=margin.left+(index*xScale)
      const y=margin.top+height-(value*yScale)
      index===0?tempCtx.moveTo(x,y):tempCtx.lineTo(x,y)
    })
    tempCtx.stroke()

    // línea egresos
    tempCtx.strokeStyle='#dc3545'
    tempCtx.lineWidth=3
    tempCtx.beginPath()
    egresos.forEach((value,index)=>{
      const x=margin.left+(index*xScale)
      const y=margin.top+height-(value*yScale)
      index===0?tempCtx.moveTo(x,y):tempCtx.lineTo(x,y)
    })
    tempCtx.stroke()

    // puntos
    ingresos.forEach((value,index)=>{
      const x=margin.left+(index*xScale)
      const y=margin.top+height-(value*yScale)
      tempCtx.fillStyle='#28a745'
      tempCtx.beginPath()
      tempCtx.arc(x,y,4,0,2*Math.PI)
      tempCtx.fill()
      tempCtx.strokeStyle='#ffffff'
      tempCtx.lineWidth=2
      tempCtx.stroke()
    })
    egresos.forEach((value,index)=>{
      const x=margin.left+(index*xScale)
      const y=margin.top+height-(value*yScale)
      tempCtx.fillStyle='#dc3545'
      tempCtx.beginPath()
      tempCtx.arc(x,y,4,0,2*Math.PI)
      tempCtx.fill()
      tempCtx.strokeStyle='#ffffff'
      tempCtx.lineWidth=2
      tempCtx.stroke()
    })

    // etiquetas eje X
    tempCtx.fillStyle='#666666'
    tempCtx.font='12px Arial'
    tempCtx.textAlign='center'
    tempCtx.textBaseline='top'
    labels.forEach((label,index)=>{
      const x=margin.left+(index*xScale)
      const y=margin.top+height+10
      tempCtx.fillText(label,x,y)
    })

    // etiquetas eje Y
    tempCtx.textAlign='right'
    tempCtx.textBaseline='middle'
    for(let i=0;i<=5;i++){
      const value=Math.round((i*maxValue)/5)
      const y=margin.top+height-(i*height/5)
      tempCtx.fillText('$'+value.toLocaleString(),margin.left-10,y)
    }

    // leyenda
    const legendX=margin.left+width-150
    const legendY=margin.top-30
    tempCtx.fillStyle='#28a745'
    tempCtx.fillRect(legendX,legendY,15,15)
    tempCtx.fillStyle='#2c3e50'
    tempCtx.font='12px Arial'
    tempCtx.textAlign='left'
    tempCtx.fillText('Ingresos',legendX+20,legendY+8)
    tempCtx.fillStyle='#dc3545'
    tempCtx.fillRect(legendX+80,legendY,15,15)
    tempCtx.fillStyle='#2c3e50'
    tempCtx.fillText('Egresos',legendX+100,legendY+8)

    // título
    tempCtx.fillStyle='#2c3e50'
    tempCtx.font='bold 16px Arial'
    tempCtx.textAlign='center'
    tempCtx.fillText('FLUJO DE CAJA HISTÓRICO',tempCanvas.width/2,30)

    resolve(tempCanvas.toDataURL('image/png',1.0))
  })
}

// Exportar PDF con validaciones
const generarPDF = async () => {
  try {
    const doc = new jsPDF()
    let yPosition = 20

    // Título principal
    doc.setFontSize(20)
    doc.setFont('helvetica','bold')
    doc.text('REPORTE FINANCIERO - TALLER MECÁNICO',105,yPosition,{align:'center'})
    yPosition+=10

    // Fecha
    doc.setFontSize(10)
    doc.setFont('helvetica','normal')
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}`,105,yPosition,{align:'center'})
    yPosition+=20

    // Resumen ejecutivo
    doc.setFontSize(16)
    doc.setFont('helvetica','bold')
    doc.text('RESUMEN EJECUTIVO',20,yPosition)
    yPosition+=10

    // Tabla resumen
    autoTable(doc,{
      startY:yPosition,
      head:[['Métrica','Valor Actual','Mes Anterior','Crecimiento']],
      body:[
        ['Ingresos Mensuales',`$${metrics.value.ingresosMes.toLocaleString()}`,`$${metrics.value.ingresosMesAnterior.toLocaleString()}`,`${crecimientoIngresos.value}%`],
        ['Egresos Mensuales',`$${metrics.value.egresosMes.toLocaleString()}`,`$${metrics.value.egresosMesAnterior.toLocaleString()}`,`${crecimientoEgresos.value}%`],
        ['Balance Actual',`$${metrics.value.balanceActual.toLocaleString()}`,'-','-'],
        ['Transacciones',metrics.value.transaccionesMes.toString(),'-','-']
      ],
      styles:{fontSize:10,cellPadding:5},
      headStyles:{fillColor:[41,128,185],textColor:255,fontStyle:'bold'},
      alternateRowStyles:{fillColor:[245,245,245]}
    })
    yPosition = doc.lastAutoTable.finalY + 15

    // Gráfico flujo
    yPosition = verificarEspacio(doc,yPosition,90)
    doc.setFontSize(16)
    doc.setFont('helvetica','bold')
    doc.text('FLUJO DE CAJA HISTÓRICO',20,yPosition)
    yPosition+=10
    const imgFlujo = await crearGraficoLineasPDF()
    doc.addImage(imgFlujo,'PNG',20,yPosition,170,80)
    yPosition+=90+10

    // Gráfico torta
    yPosition = verificarEspacio(doc,yPosition,90)
    doc.setFontSize(16)
    doc.setFont('helvetica','bold')
    doc.text('DISTRIBUCIÓN DE INGRESOS',20,yPosition)
    yPosition+=10
    const imgCategorias = await crearGraficoTortaPDF()
    doc.addImage(imgCategorias,'PNG',20,yPosition,170,80)
    yPosition+=90+10

    // Cuentas por Cobrar
    yPosition = verificarEspacio(doc,yPosition,20)
    doc.setFontSize(16)
    doc.setFont('helvetica','bold')
    doc.text('CUENTAS POR COBRAR',20,yPosition)
    yPosition+=10
    yPosition = verificarEspacio(doc,yPosition,cuentasPorCobrar.value.length*10+30)
    autoTable(doc,{
      startY:yPosition,
      head:[['Cliente','Descripción','Monto','Vencimiento','Estado']],
      body:cuentasPorCobrar.value.map(c=>[c.cliente,c.descripcion,`$${c.monto.toLocaleString()}`,c.fechaVencimiento,c.estado.toUpperCase()]),
      styles:{fontSize:8,cellPadding:3},
      headStyles:{fillColor:[255,193,7],textColor:0,fontStyle:'bold'}
    })
    yPosition = doc.lastAutoTable.finalY + 10

    // Cuentas por Pagar
    yPosition = verificarEspacio(doc,yPosition,20)
    doc.setFontSize(16)
    doc.setFont('helvetica','bold')
    doc.text('CUENTAS POR PAGAR',20,yPosition)
    yPosition+=10
    yPosition = verificarEspacio(doc,yPosition,cuentasPorPagar.value.length*10+30)
    autoTable(doc,{
      startY:yPosition,
      head:[['Proveedor','Descripción','Monto','Vencimiento','Estado']],
      body:cuentasPorPagar.value.map(c=>[c.proveedor,c.descripcion,`$${c.monto.toLocaleString()}`,c.fechaVencimiento,c.estado.toUpperCase()]),
      styles:{fontSize:8,cellPadding:3},
      headStyles:{fillColor:[220,53,69],textColor:255,fontStyle:'bold'}
    })
    yPosition = doc.lastAutoTable.finalY + 15

    // Transacciones recientes
    yPosition = verificarEspacio(doc,yPosition,20)
    doc.setFontSize(16)
    doc.setFont('helvetica','bold')
    doc.text('TRANSACCIONES RECIENTES',20,yPosition)
    yPosition+=10
    yPosition = verificarEspacio(doc,yPosition,transaccionesRecientes.value.length*10+30)
    autoTable(doc,{
      startY:yPosition,
      head:[['Fecha','Descripción','Tipo','Categoría','Monto','Estado']],
      body:transaccionesRecientes.value.map(t=>[t.fecha,t.descripcion,t.tipo.toUpperCase(),t.categoria,`$${t.monto.toLocaleString()}`,t.estado.toUpperCase()]),
      styles:{fontSize:8,cellPadding:3},
      headStyles:{fillColor:[52,152,219],textColor:255,fontStyle:'bold'},
      alternateRowStyles:{fillColor:[245,245,245]}
    })

    // Pie de página
    const pageCount = doc.getNumberOfPages()
    for(let i=1;i<=pageCount;i++){
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica','italic')
      doc.text(`Página ${i} de ${pageCount} - Taller Mecánico - Reporte Financiero Confidencial`,105,290,{align:'center'})
    }

    // Guardar PDF
    doc.save(`reporte_financiero_${new Date().toISOString().split('T')[0]}.pdf`)

  } catch(error){
    console.error('Error al generar PDF:',error)
    alert('Error al generar el PDF. Por favor, intente nuevamente.')
  }
}

// Exportar Excel (simulado)
const generarExcel = () => {
  alert('Funcionalidad de exportación a Excel activada - Datos preparados para descarga')
}

onMounted(() => {
  inicializarGraficos()
})
</script>


<template>
  <Side />
  
  <!-- Contenido Principal -->
  <div class="main-content">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1>Módulo Contable y Financiero</h1>
        <p>Gestión completa de flujo de caja y estados financieros</p>
      </div>
      <div class="header-right">
        <div class="user-profile">
          <i class="fas fa-user-shield me-2"></i>
          <span>Contador</span>
        </div>
      </div>
    </header>

    <!-- Métricas Principales -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon" style="background-color: #28a745;">
            <i class="fas fa-arrow-down"></i>
          </div>
          <div class="metric-info">
            <h3>Ingresos del Mes</h3>
            <p class="metric-value">${{ metrics.ingresosMes.toLocaleString() }}</p>
            <p class="metric-change positive">+{{ crecimientoIngresos }}% vs mes anterior</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon" style="background-color: #dc3545;">
            <i class="fas fa-arrow-up"></i>
          </div>
          <div class="metric-info">
            <h3>Egresos del Mes</h3>
            <p class="metric-value">${{ metrics.egresosMes.toLocaleString() }}</p>
            <p class="metric-change negative">+{{ crecimientoEgresos }}% vs mes anterior</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon" style="background-color: #007bff;">
            <i class="fas fa-balance-scale"></i>
          </div>
          <div class="metric-info">
            <h3>Balance Actual</h3>
            <p class="metric-value">${{ metrics.balanceActual.toLocaleString() }}</p>
            <p class="metric-change" :class="balanceMensual >= 0 ? 'positive' : 'negative'">
              {{ balanceMensual >= 0 ? '+' : '' }}${{ balanceMensual.toLocaleString() }} mensual
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon" style="background-color: #6f42c1;">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <div class="metric-info">
            <h3>Transacciones</h3>
            <p class="metric-value">{{ metrics.transaccionesMes }}</p>
            <p class="metric-change">este mes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos y Cuentas -->
    <div class="row g-3 mb-4">
      <!-- Gráfico de Flujo -->
      <div class="col-lg-8">
        <div class="card h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="card-title mb-0">
              <i class="fas fa-chart-line me-2"></i>Flujo de Caja - Últimos 6 Meses
            </h5>
          </div>
          <div class="card-body">
            <canvas id="chartFlujo" height="250"></canvas>
          </div>
        </div>
      </div>

      <!-- Distribución por Categorías -->
      <div class="col-lg-4">
        <div class="card h-100">
          <div class="card-header bg-success text-white">
            <h5 class="card-title mb-0">
              <i class="fas fa-chart-pie me-2"></i>Distribución de Ingresos
            </h5>
          </div>
          <div class="card-body">
            <canvas id="chartCategorias" height="250"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Cuentas por Cobrar y Pagar -->
    <div class="row g-3 mb-4">
      <!-- Cuentas por Cobrar -->
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header bg-warning text-dark">
            <h5 class="card-title mb-0">
              <i class="fas fa-hand-holding-usd me-2"></i>Cuentas por Cobrar
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div v-for="cuenta in cuentasPorCobrar" :key="cuenta.id" 
                   class="list-group-item">
                <div class="d-flex w-100 justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">{{ cuenta.cliente }}</h6>
                    <p class="mb-1 text-muted small">{{ cuenta.descripcion }}</p>
                  </div>
                  <div class="text-end">
                    <strong class="text-success">${{ cuenta.monto.toLocaleString() }}</strong>
                    <div class="mt-1">
                      <small class="text-muted">Vence: {{ cuenta.fechaVencimiento }}</small>
                    </div>
                    <span class="badge mt-1" :class="{
                      'bg-danger': cuenta.estado === 'vencido',
                      'bg-warning': cuenta.estado === 'pendiente',
                      'bg-info': cuenta.estado === 'hoy'
                    }">
                      {{ cuenta.estado }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cuentas por Pagar -->
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header bg-danger text-white">
            <h5 class="card-title mb-0">
              <i class="fas fa-credit-card me-2"></i>Cuentas por Pagar
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div v-for="cuenta in cuentasPorPagar" :key="cuenta.id" 
                   class="list-group-item">
                <div class="d-flex w-100 justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">{{ cuenta.proveedor }}</h6>
                    <p class="mb-1 text-muted small">{{ cuenta.descripcion }}</p>
                  </div>
                  <div class="text-end">
                    <strong class="text-danger">${{ cuenta.monto.toLocaleString() }}</strong>
                    <div class="mt-1">
                      <small class="text-muted">Vence: {{ cuenta.fechaVencimiento }}</small>
                    </div>
                    <span class="badge mt-1" :class="{
                      'bg-danger': cuenta.estado === 'vencido',
                      'bg-warning': cuenta.estado === 'pendiente',
                      'bg-info': cuenta.estado === 'hoy'
                    }">
                      {{ cuenta.estado }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transacciones Recientes -->
    <div class="card mb-4">
      <div class="card-header bg-info text-white">
        <h5 class="card-title mb-0">
          <i class="fas fa-list me-2"></i>Transacciones Recientes
        </h5>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Referencia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaccion in transaccionesRecientes" :key="transaccion.id">
                <td>{{ transaccion.fecha }}</td>
                <td>{{ transaccion.descripcion }}</td>
                <td>
                  <span class="badge" :class="transaccion.tipo === 'ingreso' ? 'bg-success' : 'bg-danger'">
                    {{ transaccion.tipo }}
                  </span>
                </td>
                <td>{{ transaccion.categoria }}</td>
                <td>
                  <strong :class="transaccion.tipo === 'ingreso' ? 'text-success' : 'text-danger'">
                    {{ transaccion.tipo === 'egreso' ? '-' : '' }}${{ transaccion.monto.toLocaleString() }}
                  </strong>
                </td>
                <td>
                  <span class="badge" :class="{
                    'bg-success': transaccion.estado === 'completado',
                    'bg-warning': transaccion.estado === 'pendiente'
                  }">
                    {{ transaccion.estado }}
                  </span>
                </td>
                <td>
                  <small class="text-muted">{{ transaccion.referencia }}</small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Botones de Exportación -->
    <div class="d-flex justify-content-end gap-2 mt-4">
      <button @click="generarPDF" class="btn btn-danger">
        <i class="fas fa-file-pdf me-2"></i> Exportar PDF con Gráficos
      </button>
      <button @click="generarExcel" class="btn btn-success">
        <i class="fas fa-file-excel me-2"></i> Exportar Excel
      </button>
    </div>

    <!-- Canvas ocultos para PDF MEJORADOS -->
    <div style="position: absolute; left: -9999px; top: -9999px; width: 800px; height: 400px;">
      <canvas id="chartFlujoPDF" width="800" height="400"></canvas>
      <canvas id="chartCategoriasPDF" width="800" height="400"></canvas>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  padding: 20px;
  min-height: 100vh;
  margin-left: 285px;
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

.metric-change.negative {
  color: #dc3545;
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

/* Botones de exportación */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
</style>