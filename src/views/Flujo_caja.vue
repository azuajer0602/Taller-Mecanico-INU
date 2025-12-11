<script setup>
import Side from '../components/SidebarComponent.vue'
import { ref, computed, onMounted } from 'vue'
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
  dineroCaja: 0,    
  dineroBanco: 0    
})

const transaccionesRecientes = ref([])
const cuentasPorCobrar = ref([])
const cuentasPorPagar = ref([])

// Variables globales para gráficos (Chart.js)
let chartFlujo = null
let chartCategorias = null

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

// --- 5. CÁLCULO DE SALDOS (CAJA VS BANCO) ---
const calcularSaldosPorMetodo = (data) => {
  let caja = 0;
  let banco = 0;

  if (!data) return;

  data.forEach(t => {
    // 1. Datos Base
    const tipoCuenta = (t.tipo_transaccion?.tipo_cuenta || "").toUpperCase().trim(); 
    const nombreTipo = (t.tipo_transaccion?.nombre_tipo || "").toLowerCase();

    // 2. Detectar Método
    const detalleConPago = t.detalles.find(d => d.Tipo_de_pago && d.Tipo_de_pago !== 'N/A');
    if (!detalleConPago) return; 

    const metodo = detalleConPago.Tipo_de_pago.toLowerCase().trim();
    const descripcionDetalle = (detalleConPago.descripcion_detalle || "").toLowerCase();

    // 3. Clasificar Origen
    const esCaja = ['bolívares', 'bolivares', 'efectivo', 'divisa', 'usd', 'caja'].some(m => metodo.includes(m));
    const esBanco = ['pago móvil', 'pago movil', 'transferencia', 'punto', 'zelle', 'banco', 'tarjeta', 'débito', 'debito'].some(m => metodo.includes(m));

    if (!esCaja && !esBanco) return;

    // 4. Calcular Monto
    const montoOperacion = t.detalles.reduce((sum, d) => sum + parseFloat(d.debe || 0), 0);

    // 5. Signos (+/-)
    let multiplicador = 0;

    if (nombreTipo.includes('cobrar')) multiplicador = 1;
    else if (nombreTipo.includes('pagar')) multiplicador = -1;
    else if (['INGRESO', 'VENTA', 'COBRO'].includes(tipoCuenta)) multiplicador = 1; 
    else if (['GASTO', 'EGRESO', 'COMPRA', 'PAGO', 'PASIVO', 'ACTIVO'].includes(tipoCuenta)) multiplicador = -1;
    else if (tipoCuenta === 'CAPITAL') {
        const esAporte = nombreTipo.includes('aporte') || descripcionDetalle.includes('aporte');
        if (esAporte) multiplicador = 1;
    }

    const montoFinal = montoOperacion * multiplicador;

    if (esCaja) caja += montoFinal;
    if (esBanco) banco += montoFinal;

    // 6. Traslados (Depósitos/Retiros)
    const textoCompleto = `${nombreTipo} ${descripcionDetalle}`;
    
    // Depósito: Sale Caja -> Entra Banco
    const esDeposito = textoCompleto.includes('deposito') || textoCompleto.includes('depósito') || textoCompleto.includes('efectivo en banco');
    if (esCaja && multiplicador === -1 && esDeposito) {
        banco += montoOperacion; 
    }

    // Retiro: Sale Banco -> Entra Caja
    const esRetiro = textoCompleto.includes('retiro') || textoCompleto.includes('reposicion caja') || textoCompleto.includes('efectivo en caja');
    if (esBanco && multiplicador === -1 && esRetiro) {
        caja += montoOperacion; 
    }
  });

  metrics.value.dineroCaja = caja;
  metrics.value.dineroBanco = banco;
};

// --- 6. CARGA DE DATOS API ---

const cargarDatos = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/transacciones') 
    
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
      }).slice(0, 50); 

      await cargarMetricas(dataRaw)
      await cargarCuentasPorCobrarPagar(dataRaw)
      
      // Calcular saldos Caja/Banco
      calcularSaldosPorMetodo(dataRaw)
      
      // Actualizar gráficos en pantalla
      setTimeout(() => {
        inicializarGraficos()
      }, 100)
      
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
    cliente: transaccion.vehiculo?.cliente_detalle?.nombre || 'General', 
    proveedor: 'Proveedor General',
    descripcion: detalle.descripcion_detalle,
    monto: monto,
    fechaVencimiento: vencimiento ? vencimiento.toLocaleDateString() : 'N/A',
    estado: vencimiento && vencimiento < hoy ? 'vencido' : 'pendiente'
  }
}

// --- 7. GRÁFICOS VISUALES (PANTALLA) ---

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

// --- 8. LÓGICA DE REPORTE FINANCIERO (PDF) MODIFICADA ---

const calcularDatosFinancieros = () => {
  // 1. ESTADO DE RESULTADOS (Ganancias y Pérdidas)
  const ingresos = transaccionesRecientes.value
    .filter(t => t.categoria.includes('Ingreso') || t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);

  const gastos = transaccionesRecientes.value
    .filter(t => t.categoria.includes('Gasto') || t.categoria.includes('Egreso') || t.tipo === 'egreso')
    .reduce((sum, t) => sum + t.monto, 0);

  const utilidadNeta = ingresos - gastos;

  // 2. BALANCE GENERAL
  const activoCorriente = metrics.value.dineroCaja + metrics.value.dineroBanco + metrics.value.cuentasPorCobrar;
  const totalActivos = activoCorriente; 

  const pasivoCorriente = metrics.value.cuentasPorPagar;
  const totalPasivos = pasivoCorriente;

  // Patrimonio ajustado para que cuadre (A = P + Pat)
  const patrimonioBase = totalActivos - totalPasivos - utilidadNeta; 
  const totalPatrimonio = patrimonioBase + utilidadNeta;

  return {
    resultados: { ingresos, gastos, utilidadNeta },
    balance: { 
      caja: metrics.value.dineroCaja,
      banco: metrics.value.dineroBanco,
      cxc: metrics.value.cuentasPorCobrar,
      totalActivos,
      cxp: metrics.value.cuentasPorPagar,
      totalPasivos,
      patrimonioBase,
      totalPatrimonio
    },
    flujo: {
      entradas: metrics.value.debeMes, 
      salidas: metrics.value.haberMes, 
      neto: metrics.value.balanceMes
    }
  };
};

const generarPDF = () => {
  try {
    const doc = new jsPDF();
    const datos = calcularDatosFinancieros();
    const ahora = new Date();
    let y = 20;

    // --- ENCABEZADO CON LOGO Y SIN FONDO AZUL ---

    // 1. Agregar el Logo (ruta absoluta desde public)
    // Ajusta las coordenadas (15, 10) y tamaño (30, 30) según tu logo exacto.
    doc.addImage('/logo.png', 'PNG', 15, 10, 30, 30);

    // 2. Texto del Encabezado (Color oscuro sobre fondo blanco)
    doc.setFontSize(22);
    // Color gris oscuro/azulado profesional
    doc.setTextColor(44, 62, 80); 
    // Texto movido a la derecha (x=125) para no pisar el logo
    doc.text('ESTADOS FINANCIEROS', 125, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100); // Gris más claro para la fecha
    doc.text(`Fecha de corte: ${ahora.toLocaleDateString('es-VE')}`, 125, 35, { align: 'center' });
    
    // Ajustamos la altura inicial del contenido
    y = 55;

    // --- CONTENIDO DEL REPORTE ---

    // 1. Estado de Resultados
    doc.setTextColor(44, 62, 80); // Volvemos al color oscuro principal
    doc.setFontSize(14);
    doc.text('1. Estado de Resultados (Ganancias y Pérdidas)', 14, y);
    y += 5;

    // Etiqueta Dinámica: Utilidad vs Pérdida
    const etiquetaResultado = datos.resultados.utilidadNeta >= 0 
        ? 'UTILIDAD NETA (GANANCIA)' 
        : 'PÉRDIDA NETA';

    autoTable(doc, {
      startY: y,
      head: [['Concepto', 'Monto (Bs.)']],
      body: [
        ['(+) Ingresos Operativos', datos.resultados.ingresos.toLocaleString('es-VE', { minimumFractionDigits: 2 })],
        ['(-) Gastos Operativos', datos.resultados.gastos.toLocaleString('es-VE', { minimumFractionDigits: 2 })],
        
        // Fila dinámica de Utilidad/Pérdida
        [
            { 
                content: etiquetaResultado, 
                styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } 
            }, 
            { 
                content: datos.resultados.utilidadNeta.toLocaleString('es-VE', { minimumFractionDigits: 2 }), 
                styles: { 
                    fontStyle: 'bold', 
                    // Color Rojo si es negativo, Negro si es positivo
                    textColor: datos.resultados.utilidadNeta < 0 ? [200, 0, 0] : [0, 0, 0] 
                } 
            }
        ]
      ],
      theme: 'grid',
      // Encabezados de tabla en azul profesional
      headStyles: { fillColor: [41, 128, 185] }, 
      columnStyles: { 1: { halign: 'right' } }
    });

    y = doc.lastAutoTable.finalY + 15;

    // 2. Balance General
    doc.text('2. Balance General (Situación Financiera)', 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Activos', 'Pasivos y Patrimonio']],
      body: [
        [
          `Caja (Efectivo): ${datos.balance.caja.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 
          `Cuentas por Pagar: ${datos.balance.cxp.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
        ],
        [
          `Bancos: ${datos.balance.banco.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 
          `Total Pasivos: ${datos.balance.totalPasivos.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
        ],
        [
          `Cuentas por Cobrar: ${datos.balance.cxc.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 
          ''
        ],
        [
          { content: `TOTAL ACTIVOS: ${datos.balance.totalActivos.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } },
          { content: `Capital/Patrimonio: ${datos.balance.patrimonioBase.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, styles: { textColor: 100 } }
        ],
        [
          '', 
          // Usamos la etiqueta dinámica también aquí
          { content: `+ ${etiquetaResultado}: ${datos.resultados.utilidadNeta.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, styles: { textColor: 100 } }
        ],
        [
          '', 
          { content: `TOTAL PASIVO + PATRIMONIO: ${(datos.balance.totalPasivos + datos.balance.totalPatrimonio).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] }, // Verde para Balance
    });

    y = doc.lastAutoTable.finalY + 15;

    // Verificar espacio para la siguiente tabla
    if (y + 40 > doc.internal.pageSize.height) {
      doc.addPage();
      y = 20;
    }

    // 3. Flujo de Caja
    doc.text('3. Resumen de Flujo de Caja (Movimientos del Mes)', 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Flujo', 'Monto (Bs.)']],
      body: [
        ['Total Entradas (Debe)', datos.flujo.entradas.toLocaleString('es-VE', { minimumFractionDigits: 2 })],
        ['Total Salidas (Haber)', datos.flujo.salidas.toLocaleString('es-VE', { minimumFractionDigits: 2 })],
        [{ content: 'FLUJO NETO DEL PERIODO', styles: { fontStyle: 'bold' } }, 
         { content: datos.flujo.neto.toLocaleString('es-VE', { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold', textColor: datos.flujo.neto >= 0 ? [0, 100, 0] : [200, 0, 0] } }]
      ],
      theme: 'striped',
      headStyles: { fillColor: [211, 84, 0] }, // Naranja para Flujo
      columnStyles: { 1: { halign: 'right' } }
    });

    // Pie de página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Generado por MecanoSoft - Sistema de Gestión Contable', 105, 290, { align: 'center' });
    }

    doc.save(`Estados_Financieros_${ahora.toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Error generando Reporte Financiero:', error);
    alert('Error al generar el reporte. Verifique que el archivo /logo.png exista en la carpeta public.');
  }
};

const generarExcel = () => {
  alert("Esta función requiere librerías adicionales (SheetJS).");
}

// --- NUEVO REPORTE: SALUD FINANCIERA (EJECUTIVO) ---

const generarReporteSalud = () => {
  try {
    const doc = new jsPDF();
    const ahora = new Date();
    const datos = calcularDatosFinancieros(); // Reutilizamos tu cálculo contable
    
    // --- CÁLCULOS DE INDICADORES (KPIs) ---
    
    // 1. Activo Corriente (Lo que tengo ya)
    const activoCorriente = datos.balance.caja + datos.balance.banco + datos.balance.cxc;
    // 2. Pasivo Corriente (Lo que debo pagar ya)
    const pasivoCorriente = datos.balance.cxp;
    
    // 3. Capital de Trabajo (Colchón financiero)
    const capitalTrabajo = activoCorriente - pasivoCorriente;
    
    // 4. Razón de Liquidez (Capacidad de pago)
    // Si es > 1: Puedes pagar. Si es < 1: Estás en problemas.
    const liquidez = pasivoCorriente > 0 ? (activoCorriente / pasivoCorriente) : (activoCorriente > 0 ? 100 : 0);
    
    // 5. Margen de Ganancia (%)
    const margenNeto = datos.resultados.ingresos > 0 
      ? ((datos.resultados.utilidadNeta / datos.resultados.ingresos) * 100) 
      : 0;

    // --- DISEÑO DEL PDF ---

    // Encabezado con Logo
    doc.addImage('/logo.png', 'PNG', 15, 10, 25, 25);
    
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('INFORME DE SALUD FINANCIERA', 115, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text('Análisis Ejecutivo y Ratios Económicos', 115, 32, { align: 'center' });
    
    let y = 50;

    // --- SECCIÓN 1: RESUMEN EJECUTIVO (INTERPRETACIÓN AUTOMÁTICA) ---
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('1. Diagnóstico General', 14, y);
    y += 8;

    doc.setFontSize(11);
    doc.setTextColor(80);
    
    let mensajeSalud = "";
    if (liquidez >= 1.5) {
        mensajeSalud = "La empresa se encuentra en una posición financiera SÓLIDA. Tiene suficiente efectivo y activos líquidos para cubrir sus deudas cómodamente y cuenta con excedente para reinvertir.";
    } else if (liquidez >= 1) {
        mensajeSalud = "La empresa tiene una posición financiera ESTABLE. Puede cubrir sus obligaciones actuales, pero se recomienda vigilar el flujo de caja para evitar imprevistos.";
    } else {
        mensajeSalud = "La empresa presenta RIESGO DE LIQUIDEZ. Actualmente las deudas a corto plazo superan el dinero disponible. Se recomienda priorizar cobros y reducir gastos urgentes.";
    }

    // Dividir texto largo para que quepa en el PDF
    const splitText = doc.splitTextToSize(mensajeSalud, 180);
    doc.text(splitText, 14, y);
    y += 20;

    // --- SECCIÓN 2: INDICADORES DE LIQUIDEZ ---
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('2. Análisis de Solvencia y Liquidez', 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Indicador', 'Valor', 'Estado', 'Interpretación']],
      body: [
        [
            'Capital de Trabajo', 
            `Bs. ${capitalTrabajo.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 
            capitalTrabajo > 0 ? 'POSITIVO' : 'CRÍTICO',
            'Dinero disponible para operar sin pedir prestado.'
        ],
        [
            'Ratio de Liquidez', 
            liquidez.toFixed(2), 
            liquidez >= 1 ? 'OPTIMO' : 'DEFICIENTE',
            `Por cada 1 Bs de deuda, tienes ${liquidez.toFixed(2)} Bs para pagar.`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] },
      columnStyles: { 
        2: { 
            fontStyle: 'bold', 
            textColor: capitalTrabajo > 0 ? [39, 174, 96] : [192, 57, 43] 
        } 
      }
    });
    
    y = doc.lastAutoTable.finalY + 15;

    // --- SECCIÓN 3: RENTABILIDAD ---
    doc.text('3. Análisis de Rentabilidad del Periodo', 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Concepto', 'Monto / Porcentaje']],
      body: [
        ['Ventas / Ingresos Totales', `Bs. ${datos.resultados.ingresos.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`],
        ['Utilidad Neta (Ganancia)', `Bs. ${datos.resultados.utilidadNeta.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`],
        [
            { content: 'MARGEN DE GANANCIA', styles: { fontStyle: 'bold' } }, 
            { 
                content: `${margenNeto.toFixed(2)} %`, 
                styles: { 
                    fontStyle: 'bold', 
                    textColor: margenNeto > 0 ? [39, 174, 96] : [192, 57, 43],
                    halign: 'right'
                } 
            }
        ]
      ],
      theme: 'striped',
      headStyles: { fillColor: [46, 204, 113] },
      columnStyles: { 1: { halign: 'right' } }
    });

    y = doc.lastAutoTable.finalY + 15;

    // Nota final
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Nota: Este reporte analiza la capacidad de la empresa para generar efectivo y cumplir compromisos.', 14, y);

    // Guardar
    doc.save(`Reporte_Salud_Financiera_${ahora.toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error(error);
    alert('Error generando reporte de salud financiera.');
  }
};

onMounted(async () => {
  await cargarDatos()
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
          <i class="fas fa-chart-bar me-2"></i>
          <span>Finanzas</span>
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
        <i class="fas fa-file-pdf me-2"></i> Exportar Reporte Financiero (PDF)
      </button>
      <button @click="generarReporteSalud" class="btn btn-info text-white">
        <i class="fas fa-heartbeat me-2"></i> Situación Económica
    </button>
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