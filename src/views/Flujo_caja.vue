<script setup>
import Side from '../components/SidebarComponent.vue'
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
// Importaciones de librerías externas
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import Chart from 'chart.js/auto'

// --- 1. ESTADO REACTIVO (VARIABLES) ---

const metrics = ref({
  debeMes: 0,
  haberMes: 0,
  balanceMes: 0, 
  transaccionesMes: 0,
  cuentasPorCobrar: 0,
  cuentasPorPagar: 0,
  dineroCaja: 0,    // Se llena si dice "Bolivares"
  dineroBanco: 0    // Se llena si dice "Transferencia" o "Pago Movil"
})

const transaccionesRecientes = ref([])
const cuentasPorCobrar = ref([])
const cuentasPorPagar = ref([])

// --- 2. COMPUTED PROPERTIES ---

const transaccionesParaTabla = computed(() => {
  return transaccionesRecientes.value || []
})

// --- 3. FUNCIONES DE ESTILO (UI/COLORES) ---

const getBadgeCategoria = (categoria) => {
  if (!categoria) return 'bg-secondary';
  const cat = categoria.toLowerCase();
  
  if (cat.includes('ingreso')) return 'bg-success'; 
  if (cat.includes('gasto') || cat.includes('egreso')) return 'bg-danger'; 
  if (cat.includes('activo')) return 'bg-primary'; 
  if (cat.includes('pasivo')) return 'bg-warning text-dark'; 
  if (cat.includes('capital') || cat.includes('patrimonio')) return 'bg-info text-dark'; 
  
  return 'bg-secondary';
}

const getBadgeEstado = (estado) => {
  if (!estado) return 'bg-secondary';
  const est = estado.toLowerCase();
  
  if (est === 'completado' || est === 'procesado') return 'bg-success';
  if (est === 'pendiente') return 'bg-warning text-dark';
  if (est === 'anulado') return 'bg-dark';
  
  return 'bg-secondary';
}

// --- 4. LÓGICA DE NEGOCIO (HELPERS) ---

const calcularMontoTransaccion = (detalles) => {
  if (!detalles || detalles.length === 0) return 0
  const totalDebe = detalles.reduce((sum, d) => sum + parseFloat(d.debe || 0), 0)
  const totalHaber = detalles.reduce((sum, d) => sum + parseFloat(d.haber || 0), 0)
  return Math.max(totalDebe, totalHaber)
}

const determinarCategoria = (transaccion) => {
  if (transaccion.tipo_transaccion && transaccion.tipo_transaccion.tipo_cuenta) {
    const tipo = transaccion.tipo_transaccion.tipo_cuenta; 
    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  }
  return 'General'
}

const obtenerDescripcionInteligente = (transaccion) => {
  if (transaccion.tipo_transaccion?.nombre_tipo) {
      return transaccion.tipo_transaccion.nombre_tipo;
  }
  return transaccion.detalles?.[0]?.descripcion_detalle || 'Transacción General';
}

const obtenerCodigoTipo = (transaccion) => {
  if (transaccion.tipo_transaccion) {
    return `${transaccion.tipo_transaccion.codigo_tipo_transaccion || ''} - ${transaccion.tipo_transaccion.nombre_tipo || ''}`
  }
  return 'S/C'
}


// --- LÓGICA FINAL (CORREGIDO COBRAR vs PAGAR) ---
const calcularSaldosPorMetodo = (data) => {
  let caja = 0;
  let banco = 0;

  if (!data) return;

  data.forEach(t => {
    // --- 1. DATOS BASE ---
    const tipoCuenta = (t.tipo_transaccion?.tipo_cuenta || "").toUpperCase().trim(); 
    const nombreTipo = (t.tipo_transaccion?.nombre_tipo || "").toLowerCase();

    // --- 2. DETECTAR MÉTODO DE PAGO ---
    const detalleConPago = t.detalles.find(d => d.Tipo_de_pago && d.Tipo_de_pago !== 'N/A');
    if (!detalleConPago) return; 

    const metodo = detalleConPago.Tipo_de_pago.toLowerCase().trim();
    const descripcionDetalle = (detalleConPago.descripcion_detalle || "").toLowerCase();

    // --- 3. CLASIFICAR ORIGEN (CAJA vs BANCO) ---
    const esCaja = ['bolívares', 'bolivares', 'efectivo', 'divisa', 'usd', 'caja'].some(m => metodo.includes(m));
    const esBanco = ['pago móvil', 'pago movil', 'transferencia', 'punto', 'zelle', 'banco', 'tarjeta', 'débito', 'debito'].some(m => metodo.includes(m));

    if (!esCaja && !esBanco) return;

    // --- 4. CALCULAR MONTO ---
    const montoOperacion = t.detalles.reduce((sum, d) => sum + parseFloat(d.debe || 0), 0);

    // --- 5. LÓGICA DE SIGNOS (PRIORIDAD A COBRAR/PAGAR) ---
    let multiplicador = 0;

    // REGLA 1: Si dice explícitamente "COBRAR" en el nombre (ej: "Cuenta por Cobrar", "Cobro Cliente")
    // Significa que entra dinero -> SUMA
    if (nombreTipo.includes('cobrar')) {
        multiplicador = 1;
    }
    // REGLA 2: Si dice explícitamente "PAGAR" en el nombre (ej: "Cuenta por Pagar", "Pago Proveedor")
    // Significa que sale dinero -> RESTA
    else if (nombreTipo.includes('pagar')) {
        multiplicador = -1;
    }
    // REGLA 3: Si es Ingreso/Venta puro -> SUMA
    else if (['INGRESO', 'VENTA', 'COBRO'].includes(tipoCuenta)) {
        multiplicador = 1; 
    }
    // REGLA 4: Si es Gasto/Egreso/Activo/Pasivo estándar -> RESTA
    else if (['GASTO', 'EGRESO', 'COMPRA', 'PAGO', 'PASIVO', 'ACTIVO'].includes(tipoCuenta)) {
        multiplicador = -1;
    }
    // REGLA 5: Capital (Aporte de socios) -> SUMA
    else if (tipoCuenta === 'CAPITAL') {
        const esAporte = nombreTipo.includes('aporte') || descripcionDetalle.includes('aporte');
        if (esAporte) multiplicador = 1;
    }

    // Aplicamos el signo al monto
    const montoFinal = montoOperacion * multiplicador;

    // Sumamos o restamos al saldo correspondiente
    if (esCaja) caja += montoFinal;
    if (esBanco) banco += montoFinal;


    // --- 6. EL "PLUS": LOGICA DE TRASLADOS (DEPÓSITOS Y RETIROS) ---
    const textoCompleto = `${nombreTipo} ${descripcionDetalle}`;

    // CASO A: DEPÓSITO (Sale de Caja -> Entra a Banco)
    // Si salió de caja (multiplicador -1) pero dice Depósito -> Sumar al Banco
    const esDeposito = textoCompleto.includes('deposito') || 
                       textoCompleto.includes('depósito') || 
                       textoCompleto.includes('efectivo en banco');

    if (esCaja && multiplicador === -1 && esDeposito) {
        banco += montoOperacion; 
    }

    // CASO B: RETIRO (Sale de Banco -> Entra a Caja)
    // Si salió de banco (multiplicador -1) pero dice Retiro -> Sumar a Caja
    const esRetiro = textoCompleto.includes('retiro') || 
                     textoCompleto.includes('reposicion caja') ||
                     textoCompleto.includes('efectivo en caja');

    if (esBanco && multiplicador === -1 && esRetiro) {
        caja += montoOperacion; 
    }
  });

  metrics.value.dineroCaja = caja;
  metrics.value.dineroBanco = banco;
};
// --- 5. CARGA DE DATOS (API) ---

const cargarDatos = async () => {
  try {
    const response = await axios.get('/api/transacciones')
    
    if (response.data && response.data.success) {
      const dataRaw = response.data.data;
      
      transaccionesRecientes.value = dataRaw.map(t => {
        const tipoCuenta = t.tipo_transaccion?.tipo_cuenta || 'GENERAL';
        let tipoLogico = 'ajuste';
        
        if(tipoCuenta === 'INGRESO') tipoLogico = 'ingreso';
        else if(tipoCuenta === 'GASTO') tipoLogico = 'egreso';
        else tipoLogico = 'balance'; 

        let estadoCalculado = 'completado'; 
        if (t.detalles) {
          const detallePendiente = t.detalles.find(d => {
            const esCredito = d.es_cuenta_por_pagar || d.es_cuenta_por_cobrar;
            if (!esCredito) return false;
            if (!d.fecha_vencimiento) return false;
            const vencimiento = new Date(d.fecha_vencimiento);
            const hoy = new Date();
            return vencimiento >= hoy; 
          });
          if (detallePendiente) estadoCalculado = 'pendiente';
        }

        return {
          id: t.id_transaccion,
          fecha: t.fecha_asiento 
                ? t.fecha_asiento.split('T')[0].split('-').reverse().join('/') 
                : 'N/A', 
          descripcion: obtenerDescripcionInteligente(t),
          tipo: tipoLogico, 
          categoria: determinarCategoria(t),
          monto: calcularMontoTransaccion(t.detalles),
          estado: estadoCalculado, 
          referencia: `TRX-${t.id_transaccion}`,
          codigo_contable: obtenerCodigoTipo(t),
          detalles: t.detalles || [],
          tipo_pago: t.tipo_pago 
        }
      }).slice(0, 10); 

      await cargarMetricas(dataRaw)
      await cargarCuentasPorCobrarPagar(dataRaw)
      
      // Ejecutamos la lógica corregida
      calcularSaldosPorMetodo(dataRaw)
      
    } else {
      transaccionesRecientes.value = [];
    }
  } catch (error) {
    console.error('❌ Error cargando datos:', error)
    transaccionesRecientes.value = [];
  }
}

const cargarMetricas = async (data) => {
  const hoy = new Date()
  const mesActual = hoy.getMonth() 
  const yearActual = hoy.getFullYear()

  metrics.value.debeMes = 0
  metrics.value.haberMes = 0

  data.forEach(t => {
    if (!t.fecha_asiento) return;

    const fechaStr = t.fecha_asiento.split('T')[0]; 
    const partes = fechaStr.split('-'); 
    const yearTrx = parseInt(partes[0]);
    const mesTrx = parseInt(partes[1]) - 1; 

    if (mesTrx === mesActual && yearTrx === yearActual) {
      if (t.detalles) {
        t.detalles.forEach(detalle => {
          metrics.value.debeMes += parseFloat(detalle.debe || 0);
          metrics.value.haberMes += parseFloat(detalle.haber || 0);
        });
      }
    }
  });

  metrics.value.balanceMes = metrics.value.debeMes - metrics.value.haberMes;
  
  metrics.value.transaccionesMes = data.filter(t => {
    const fechaStr = t.fecha_asiento.split('T')[0];
    const partes = fechaStr.split('-');
    const yearTrx = parseInt(partes[0]);
    const mesTrx = parseInt(partes[1]) - 1;
    return mesTrx === mesActual && yearTrx === yearActual;
  }).length;
}

const cargarCuentasPorCobrarPagar = async (data) => {
  cuentasPorCobrar.value = [];
  cuentasPorPagar.value = [];

  data.forEach(t => {
    if (t.detalles) {
      t.detalles.forEach(d => {
        if (d.es_cuenta_por_cobrar == 1) {
          cuentasPorCobrar.value.push(crearObjetoCuenta(d, t, 'Cliente'));
        }
        if (d.es_cuenta_por_pagar == 1) {
          cuentasPorPagar.value.push(crearObjetoCuenta(d, t, 'Proveedor'));
        }
      })
    }
  })
  
  metrics.value.cuentasPorCobrar = cuentasPorCobrar.value.reduce((sum, c) => sum + c.monto, 0)
  metrics.value.cuentasPorPagar = cuentasPorPagar.value.reduce((sum, c) => sum + c.monto, 0)
}

const crearObjetoCuenta = (detalle, transaccion, tipoEntidad) => {
  const vencimiento = detalle.fecha_vencimiento ? new Date(detalle.fecha_vencimiento) : null;
  const hoy = new Date();
  const monto = Math.max(parseFloat(detalle.debe || 0), parseFloat(detalle.haber || 0));

  return {
    id: detalle.id_detalle,
    entidad: tipoEntidad,
    descripcion: detalle.descripcion_detalle,
    monto: monto,
    fechaVencimiento: vencimiento ? vencimiento.toLocaleDateString() : 'N/A',
    estado: vencimiento && vencimiento < hoy ? 'vencido' : 'pendiente'
  }
}

// --- VARIABLES GLOBALES PARA GRÁFICOS ---
let chartFlujo = null
let chartCategorias = null

// --- 1. PROCESAMIENTO DE DATOS PARA GRÁFICOS ---

const obtenerDatosGraficos = () => {
  const data = transaccionesRecientes.value || [] 
  
  const meses = {}
  const hoy = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const label = d.toLocaleDateString('es-VE', { month: 'short' })
    meses[key] = { label, debe: 0, haber: 0 }
  }

  data.forEach(t => {
    if (t.fecha && typeof t.fecha === 'string' && t.fecha.includes('/')) {
        const partes = t.fecha.split('/'); 
        
        if (partes.length === 3) {
            const anio = parseInt(partes[2]);
            const mesIndex = parseInt(partes[1]) - 1; 
            
            const key = `${anio}-${mesIndex}`;

            if (meses[key]) {
                t.detalles.forEach(det => {
                    meses[key].debe += parseFloat(det.debe || 0)
                    meses[key].haber += parseFloat(det.haber || 0)
                })
            }
        }
    }
  })

  const labelsLine = Object.values(meses).map(m => m.label)
  const dataDebe = Object.values(meses).map(m => m.debe)
  const dataHaber = Object.values(meses).map(m => m.haber)
 
  const categorias = {}
  data.forEach(t => {
    const cat = t.categoria || 'General'
    if (!categorias[cat]) categorias[cat] = 0
    categorias[cat] += t.monto 
  })

  const labelsDona = Object.keys(categorias)
  const dataDona = Object.values(categorias)

  return { labelsLine, dataDebe, dataHaber, labelsDona, dataDona }
}

// --- 2. INICIALIZAR GRÁFICOS WEB (Chart.js) ---

const inicializarGraficos = () => {
  const ctxFlujo = document.getElementById('chartFlujo')
  const ctxCategorias = document.getElementById('chartCategorias')
  
  if (!ctxFlujo || !ctxCategorias) return 

  if (chartFlujo) chartFlujo.destroy()
  if (chartCategorias) chartCategorias.destroy()

  const { labelsLine, dataDebe, dataHaber, labelsDona, dataDona } = obtenerDatosGraficos()

  chartFlujo = new Chart(ctxFlujo, {
    type: 'line',
    data: {
      labels: labelsLine,
      datasets: [
        { 
          label: 'Total Debe', 
          data: dataDebe, 
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)', 
          tension: 0.4, 
          fill: true,
          borderWidth: 2
        },
        { 
          label: 'Total Haber', 
          data: dataHaber, 
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)', 
          tension: 0.4, 
          fill: true,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: { 
        y: { 
          beginAtZero: true, 
          ticks: { callback: value => 'Bs. ' + value.toLocaleString() } 
        } 
      }
    }
  })
  
  chartCategorias = new Chart(ctxCategorias, {
    type: 'doughnut',
    data: {
      labels: labelsDona,
      datasets: [{ 
        data: dataDona, 
        backgroundColor: ['#0dcaf0', '#198754', '#ffc107', '#fd7e14', '#6610f2', '#20c997'], 
        borderWidth: 2, 
        borderColor: '#ffffff' 
      }]
    },
    options: { 
      responsive: true, 
      plugins: { legend: { position: 'bottom' } } 
    }
  })
}

// --- 3. GENERADORES PARA PDF ---

const verificarEspacio = (doc, yActual, altoNecesario, margenInferior = 20) => {
  if (yActual + altoNecesario + margenInferior > doc.internal.pageSize.height) {
    doc.addPage()
    return 20 
  }
  return yActual
}

const crearGraficoLineasPDF = async (labels, dataDebe, dataHaber) => {
  return new Promise(resolve => {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 800
    tempCanvas.height = 400
    const tempCtx = tempCanvas.getContext('2d')
    
    tempCtx.fillStyle = '#ffffff'
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

    const margin = { top: 60, right: 40, bottom: 60, left: 80 }
    const width = tempCanvas.width - margin.left - margin.right
    const height = tempCanvas.height - margin.top - margin.bottom
    
    const maxValue = Math.max(...dataDebe, ...dataHaber, 100) 
    const xScale = width / (Math.max(labels.length - 1, 1))
    const yScale = height / maxValue

    tempCtx.strokeStyle = '#cccccc'; tempCtx.lineWidth = 1;
    tempCtx.beginPath(); tempCtx.moveTo(margin.left, margin.top); tempCtx.lineTo(margin.left, margin.top + height); tempCtx.stroke(); 
    tempCtx.beginPath(); tempCtx.moveTo(margin.left, margin.top + height); tempCtx.lineTo(margin.left + width, margin.top + height); tempCtx.stroke(); 

    const drawLine = (data, color) => {
      tempCtx.strokeStyle = color; tempCtx.lineWidth = 3; tempCtx.beginPath();
      data.forEach((value, index) => {
        const x = margin.left + (index * xScale)
        const y = margin.top + height - (value * yScale)
        index === 0 ? tempCtx.moveTo(x, y) : tempCtx.lineTo(x, y)
      })
      tempCtx.stroke()
    }

    drawLine(dataDebe, '#0d6efd') 
    drawLine(dataHaber, '#dc3545') 

    tempCtx.fillStyle = '#666'; tempCtx.font = '12px Arial'; tempCtx.textAlign = 'center'; tempCtx.textBaseline = 'top';
    labels.forEach((label, index) => {
      tempCtx.fillText(label, margin.left + (index * xScale), margin.top + height + 10)
    })

    tempCtx.textAlign = 'right'; tempCtx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((i * maxValue) / 5)
      const y = margin.top + height - (i * height / 5)
      tempCtx.fillText('Bs. ' + value.toLocaleString(), margin.left - 10, y)
    }

    tempCtx.fillStyle = '#2c3e50'; tempCtx.font = 'bold 16px Arial'; tempCtx.textAlign = 'center';
    tempCtx.fillText('HISTÓRICO DEBE VS HABER', tempCanvas.width / 2, 30)

    tempCtx.fillStyle = '#0d6efd'; tempCtx.fillRect(tempCanvas.width - 200, 20, 15, 15);
    tempCtx.fillStyle = '#333'; tempCtx.textAlign = 'left'; tempCtx.fillText('Debe', tempCanvas.width - 180, 32);
    
    tempCtx.fillStyle = '#dc3545'; tempCtx.fillRect(tempCanvas.width - 120, 20, 15, 15);
    tempCtx.fillStyle = '#333'; tempCtx.fillText('Haber', tempCanvas.width - 100, 32);

    resolve(tempCanvas.toDataURL('image/png', 1.0))
  })
}

const crearGraficoTortaPDF = async (labels, data) => {
  return new Promise(resolve => {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 600
    tempCanvas.height = 400
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.fillStyle = '#ffffff'; tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    const colors = ['#0dcaf0', '#198754', '#ffc107', '#fd7e14', '#6610f2', '#20c997']
    const total = data.reduce((a, b) => a + b, 0) || 1 
    
    const centerX = tempCanvas.width / 2
    const centerY = tempCanvas.height / 2
    const radius = 120
    let startAngle = 0

    data.forEach((value, index) => {
      const sliceAngle = (2 * Math.PI * value) / total
      tempCtx.beginPath()
      tempCtx.moveTo(centerX, centerY)
      tempCtx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      tempCtx.closePath()
      tempCtx.fillStyle = colors[index % colors.length]
      tempCtx.fill()
      startAngle += sliceAngle
    })

    tempCtx.beginPath(); tempCtx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI); 
    tempCtx.fillStyle = '#ffffff'; tempCtx.fill();

    let legendY = 60; const legendX = 20;
    labels.forEach((label, index) => {
      const pct = Math.round((data[index] / total) * 100)
      tempCtx.fillStyle = colors[index % colors.length]
      tempCtx.fillRect(legendX, legendY, 15, 15)
      tempCtx.fillStyle = '#333'; tempCtx.font = '12px Arial'; tempCtx.textAlign = 'left';
      tempCtx.fillText(`${label} (${pct}%)`, legendX + 25, legendY + 12)
      legendY += 25
    })

    tempCtx.fillStyle = '#2c3e50'; tempCtx.font = 'bold 16px Arial'; tempCtx.textAlign = 'center';
    tempCtx.fillText('DISTRIBUCIÓN POR CATEGORÍA', centerX, 30)

    resolve(tempCanvas.toDataURL('image/png', 1.0))
  })
}

// --- 4. EXPORTAR PDF ---

const generarPDF = async () => {
  try {
    const doc = new jsPDF()
    let yPosition = 20
    const { labelsLine, dataDebe, dataHaber, labelsDona, dataDona } = obtenerDatosGraficos()

    doc.setFontSize(18)
    doc.setTextColor(44, 62, 80)
    doc.text('REPORTE FINANCIERO', 105, yPosition, { align: 'center' })
    yPosition += 10
    
    const ahora = new Date()
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado el: ${ahora.toLocaleDateString('es-ES')} a las ${ahora.toLocaleTimeString('es-ES')}`, 105, yPosition, { align: 'center' })
    yPosition += 20

    autoTable(doc, {
      startY: yPosition,
      head: [['Concepto', 'Total Mes', 'Balance']],
      body: [
        ['Total Debe (Entradas/Activos)', `$${metrics.value.debeMes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, ''],
        ['Total Haber (Salidas/Pasivos)', `$${metrics.value.haberMes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, ''],
        ['Cuadre Contable', '', `$${metrics.value.balanceMes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] },
      styles: { halign: 'right' },
      columnStyles: { 0: { halign: 'left' } }
    })
    yPosition = doc.lastAutoTable.finalY + 15

    if (labelsLine.length > 0) {
        yPosition = verificarEspacio(doc, yPosition, 100)
        const imgLine = await crearGraficoLineasPDF(labelsLine, dataDebe, dataHaber)
        doc.addImage(imgLine, 'PNG', 15, yPosition, 180, 90)
        yPosition += 100
    }

    if (labelsDona.length > 0) {
        yPosition = verificarEspacio(doc, yPosition, 100)
        const imgDona = await crearGraficoTortaPDF(labelsDona, dataDona)
        doc.addImage(imgDona, 'PNG', 15, yPosition, 180, 90)
        yPosition += 100
    }

    yPosition = verificarEspacio(doc, yPosition, 40)
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text('Detalle de Transacciones', 14, yPosition)
    yPosition += 10
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Fecha', 'Código', 'Descripción', 'Categoría', 'Monto', 'Ref']],
      body: transaccionesRecientes.value.map(t => [
        t.fecha, 
        t.codigo_contable, 
        t.descripcion, 
        t.categoria, 
        `Bs. ${t.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
        t.referencia
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [13, 110, 253] },
      columnStyles: {
        4: { halign: 'right' }
      }
    })

    const fechaStr = ahora.toISOString().split('T')[0] 
    const horaStr = ahora.toTimeString().split(' ')[0].replace(/:/g, '-') 
    
    const nombreArchivo = `reporte_contable_${fechaStr}_${horaStr}.pdf`
    
    doc.save(nombreArchivo)

  } catch (error) {
    console.error('Error generando PDF:', error)
    alert('Hubo un error al crear el PDF. Revisa la consola.')
  }
}

const generarExcel = () => {
  // Lógica de exportación Excel pendiente o simple
  alert("Funcionalidad Excel pendiente de implementación completa");
}

onMounted(async () => {
  await cargarDatos()
  setTimeout(() => {
    inicializarGraficos()
  }, 100)
})
</script>

<template>
  <Side />

  <div class="main-content">
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

    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <div class="metric-card border-start border-success border-4">
          <div class="metric-icon bg-success text-white">
            <i class="fas fa-cash-register"></i>
          </div>
          <div class="metric-info w-100">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="text-success fw-bold mb-0">DINERO EN CAJA (EFECTIVO)</h3>
              <span class="badge bg-success bg-opacity-10 text-success px-3">Disponible</span>
            </div>
            <p class="metric-value text-dark mt-2 mb-0">
              Bs. {{ metrics.dineroCaja.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </p>
            <small class="text-muted">Calculado según movimientos en efectivo</small>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="metric-card border-start border-primary border-4">
          <div class="metric-icon bg-primary text-white">
            <i class="fas fa-university"></i>
          </div>
          <div class="metric-info w-100">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="text-primary fw-bold mb-0">DINERO EN BANCOS</h3>
              <span class="badge bg-primary bg-opacity-10 text-primary px-3">Bancos Digitales</span>
            </div>
            <p class="metric-value text-dark mt-2 mb-0">
              Bs. {{ metrics.dineroBanco.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </p>
            <small class="text-muted">Pago Móvil, Transferencias, Puntos</small>
          </div>
        </div>
      </div>
    </div>

  <div class="row g-3 mb-4">
      
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon bg-primary bg-opacity-10 text-primary">
            <i class="fas fa-book-open"></i>
          </div>
          <div class="metric-info">
            <h3 class="text-primary fw-bold">TOTAL DEBE (MES)</h3>
            <p class="metric-value text-dark">
              Bs. {{ metrics.debeMes.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="metric-change text-muted small">
              <i class="fas fa-info-circle me-1"></i>Movimiento Deudor
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon bg-danger bg-opacity-10 text-danger">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div class="metric-info">
            <h3 class="text-danger fw-bold">TOTAL HABER (MES)</h3>
            <p class="metric-value text-dark">
              Bs. {{ metrics.haberMes.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="metric-change text-muted small">
              <i class="fas fa-info-circle me-1"></i>Movimiento Acreedor
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon" 
               :class="metrics.balanceMes === 0 ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'">
            <i class="fas fa-balance-scale"></i>
          </div>
          <div class="metric-info">
            <h3 class="fw-bold" :class="metrics.balanceMes === 0 ? 'text-success' : 'text-warning'">
              CUADRE CONTABLE
            </h3>
            <p class="metric-value text-dark">
              Bs. {{ metrics.balanceMes.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="metric-change small" :class="metrics.balanceMes === 0 ? 'text-success' : 'text-warning'">
              <i class="fas" :class="metrics.balanceMes === 0 ? 'fa-check' : 'fa-exclamation-triangle'"></i>
              {{ metrics.balanceMes === 0 ? 'Balanceado' : 'Descuadre detectado' }}
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon bg-info bg-opacity-10 text-info">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <div class="metric-info">
            <h3 class="text-info fw-bold">TRANSACCIONES</h3>
            <p class="metric-value text-dark">{{ metrics.transaccionesMes }}</p>
            <p class="metric-change text-muted small">Registros este mes</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-4">
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

    <div class="row g-3 mb-4">
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header bg-warning text-dark">
            <h5 class="card-title mb-0">
              <i class="fas fa-hand-holding-usd me-2"></i>Cuentas por Cobrar
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div v-for="cuenta in cuentasPorCobrar" :key="cuenta.id" class="list-group-item">
                <div class="d-flex w-100 justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">{{ cuenta.cliente }}</h6>
                    <p class="mb-1 text-muted small">{{ cuenta.descripcion }}</p>
                  </div>
                  <div class="text-end">
                    <strong class="text-success">Bs. {{ cuenta.monto.toLocaleString() }}</strong>
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

      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header bg-danger text-white">
            <h5 class="card-title mb-0">
              <i class="fas fa-credit-card me-2"></i>Cuentas por Pagar
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div v-for="cuenta in cuentasPorPagar" :key="cuenta.id" class="list-group-item">
                <div class="d-flex w-100 justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">{{ cuenta.proveedor }}</h6>
                    <p class="mb-1 text-muted small">{{ cuenta.descripcion }}</p>
                  </div>
                  <div class="text-end">
                    <strong class="text-danger">Bs. {{ cuenta.monto.toLocaleString() }}</strong>
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

    <div class="card mb-4">
  <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
    <h5 class="card-title mb-0">
      <i class="fas fa-list me-2"></i>Transacciones Recientes
    </h5>
    <button @click="cargarDatos" class="btn btn-light btn-sm">
      <i class="fas fa-sync-alt me-1"></i> Actualizar
    </button>
  </div>
  <div class="card-body p-0">
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Clasificación</th> <th>Monto</th>
            <th>Cód. Transacción</th> <th>Estado</th>
          </tr>
        </thead>
     <tbody>
  <tr v-if="transaccionesParaTabla && transaccionesParaTabla.length === 0">
    <td colspan="7" class="text-center py-4">
      <div class="text-muted">
        <i class="fas fa-inbox fa-2x mb-2"></i>
        <p>No hay transacciones registradas</p>
      </div>
    </td>
  </tr>
  
  <tr v-for="trx in transaccionesParaTabla" :key="trx.id">
    <td class="align-middle">
      <span class="text-muted small fw-bold">#{{ trx.id }}</span>
    </td>
    
    <td class="align-middle text-nowrap">
      <i class="far fa-calendar-alt text-muted me-1"></i>
      {{ trx.fecha }}
    </td>
    
    <td class="align-middle">
      <span class="fw-medium text-dark">{{ trx.descripcion }}</span>
    </td>
    
    <td class="align-middle">
      <span class="badge rounded-pill shadow-sm px-3 py-2" 
            :class="getBadgeCategoria(trx.categoria)">
        <i class="fas fa-arrow-up me-1" v-if="trx.categoria.includes('Ingreso')"></i>
        <i class="fas fa-arrow-down me-1" v-if="trx.categoria.includes('Gasto')"></i>
        <i class="fas fa-university me-1" v-if="trx.categoria.includes('Capital')"></i>
        <i class="fas fa-wallet me-1" v-if="trx.categoria.includes('Activo')"></i>
        {{ trx.categoria }}
      </span>
    </td>
    
    <td class="align-middle">
      <strong :class="{
        'text-success': trx.tipo === 'ingreso', 
        'text-danger': trx.tipo === 'egreso',
        'text-dark': trx.tipo === 'balance'
      }" class="fs-6">
        Bs. {{ trx.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
      </strong>
    </td>
    
    <td class="align-middle">
      <small class="text-muted bg-light px-2 py-1 rounded border">
        {{ trx.codigo_contable }}
      </small>
    </td>
    
    <td class="align-middle">
      <span class="badge" 
            :class="getBadgeEstado(trx.estado)">
        <i class="fas fa-check-circle me-1" v-if="trx.estado === 'completado'"></i>
        {{ trx.estado.charAt(0).toUpperCase() + trx.estado.slice(1) }}
      </span>
    </td>
  </tr>
</tbody>
      </table>
    </div>
  </div>
</div>

    <div class="d-flex justify-content-end gap-2 mt-4">
      <button @click="generarPDF" class="btn btn-danger">
        <i class="fas fa-file-pdf me-2"></i> Exportar PDF con Gráficos
      </button>
      <button @click="generarExcel" class="btn btn-success">
        <i class="fas fa-file-excel me-2"></i> Exportar Excel
      </button>
    </div>

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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

/* Metric Cards */
.metric-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  height: 100%;
  border: 1px solid #e9ecef;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>