<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import api from '../backend/services/api.js';

// --- ESTADO ---
const transacciones = ref([]);
const tiposDeOperacion = ref([]); 
const filtroBusqueda = ref('');
const saldos = ref({ caja: 0, banco: 0 }); 
let modalInstancia = null;

const obtenerFechaLocal = () => {
  const fecha = new Date();
  const offset = fecha.getTimezoneOffset() * 60000; 
  return new Date(fecha - offset).toISOString().split('T')[0];
};

const nuevaOperacion = ref({
  descripcion: '',
  monto: '',
  fecha: obtenerFechaLocal(),
  fechaVencimiento: '', 
  id_tipo_transaccion: '', 
  metodoPago: 'Bolívares en efectivo'
});
const metodosPago = ['Bolívares en efectivo', 'Punto de Venta', 'Pago Móvil', 'Transferencia', 'Crédito'];

// --- COMPUTED ---
const tipoSeleccionado = computed(() => {
  if (!tiposDeOperacion.value) return undefined;
  return tiposDeOperacion.value.find(t => 
    t.id_tipo_transaccion === nuevaOperacion.value.id_tipo_transaccion || 
    t.id_tipo_transaccion_pk === nuevaOperacion.value.id_tipo_transaccion
  );
});

const esCuentaPorPagar = computed(() => {
  if (!tipoSeleccionado.value) return false;
  const nombre = (tipoSeleccionado.value.nombre_tipo || '').toLowerCase();
  const tipo = (tipoSeleccionado.value.tipo_cuenta || '').toUpperCase();
  return nombre.includes('pagar') || nombre.includes('proveedor') || (tipo === 'PASIVO' && !nombre.includes('capital'));
});

const esCuentaPorCobrar = computed(() => {
  if (!tipoSeleccionado.value) return false;
  const nombre = (tipoSeleccionado.value.nombre_tipo || '').toLowerCase();
  return nombre.includes('cobrar') || nombre.includes('cliente') || nombre.includes('credito');
});

const operacionesFiltradas = computed(() => {
  if (!filtroBusqueda.value) return transacciones.value || [];
  const texto = filtroBusqueda.value.toLowerCase();
  if (!transacciones.value) return [];
  
  return transacciones.value.filter(t => {
    const desc = t.detalles?.[0]?.descripcion_detalle || '';
    const tipo = t.tipo_transaccion?.nombre_tipo || '';
    return desc.toLowerCase().includes(texto) || tipo.toLowerCase().includes(texto);
  });
});

// --- HELPER MONEDA: VERSIÓN A PRUEBA DE FALLOS ---
const formatoMoneda = (valor) => {
    let num = Number(valor);
    if (isNaN(num)) num = 0;
    let str = num.toFixed(2);
    let partes = str.split('.');
    let parteEntera = partes[0];
    let parteDecimal = partes[1];
    parteEntera = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Bs. ${parteEntera},${parteDecimal}`;
};

// --- HELPER COLOR BADGE (ESTE FALTABA) ---
const obtenerColorBadge = (tipoCuenta) => {
  if (!tipoCuenta) return 'bg-secondary';
  const tipo = tipoCuenta.toUpperCase();
  if (['INGRESO', 'VENTA', 'COBRO'].includes(tipo)) return 'bg-success';
  if (['GASTO', 'EGRESO', 'COMPRA', 'PAGO'].includes(tipo)) return 'bg-danger';
  if (tipo === 'ACTIVO') return 'bg-primary';
  if (['CAPITAL', 'PATRIMONIO'].includes(tipo)) return 'bg-info text-dark';
  return 'bg-secondary';
};

// --- VALIDACIÓN REACTIVA ---
const mensajeAdvertenciaSaldo = computed(() => {
  const monto = parseFloat(nuevaOperacion.value.monto) || 0;
  if (monto <= 0) return null;

  const tipo = tipoSeleccionado.value;
  if (!tipo) return null;
  
  const esSalida = ['GASTO', 'EGRESO', 'COMPRA', 'PAGO', 'PASIVO', 'ACTIVO'].includes((tipo.tipo_cuenta || '').toUpperCase());
  
  if (!esSalida || esCuentaPorPagar.value || nuevaOperacion.value.metodoPago === 'Crédito') {
    return null;
  }

  const metodo = nuevaOperacion.value.metodoPago;
  const esCaja = metodo === 'Bolívares';
  const esBanco = ['Punto de Venta', 'Pago Móvil', 'Transferencia'].includes(metodo);

  if (esCaja && monto > saldos.value.caja) {
    return `No tienes saldo suficiente (Disp: ${formatoMoneda(saldos.value.caja)})`;
  }

  if (esBanco && monto > saldos.value.banco) {
    return `No tienes saldo suficiente (Disp: ${formatoMoneda(saldos.value.banco)})`;
  }

  return null;
});

// --- CÁLCULO DE SALDOS ---
const calcularSaldosActuales = (data) => {
    let caja = 0;
    let banco = 0;

    if (!data || !Array.isArray(data)) return;

    data.forEach(t => {
        const tipoCuenta = (t.tipo_transaccion?.tipo_cuenta || "").toUpperCase().trim(); 
        const nombreTipo = (t.tipo_transaccion?.nombre_tipo || "").toLowerCase();
        
        if (!t.detalles) return;

        const detalleConPago = t.detalles.find(d => d.Tipo_de_pago && d.Tipo_de_pago !== 'N/A');
        if (!detalleConPago) return; 

        const metodo = (detalleConPago.Tipo_de_pago || "").toLowerCase().trim();
        const descripcionDetalle = (detalleConPago.descripcion_detalle || "").toLowerCase();

        const esCaja = ['bolívares', 'bolivares', 'efectivo', 'divisa', 'usd', 'caja'].some(m => metodo.includes(m));
        const esBanco = ['pago móvil', 'pago movil', 'transferencia', 'punto', 'zelle', 'banco', 'tarjeta'].some(m => metodo.includes(m));

        if (!esCaja && !esBanco) return;

        const montoOperacion = t.detalles.reduce((sum, d) => sum + parseFloat(d.debe || 0), 0);
        let multiplicador = 0;

        if (nombreTipo.includes('cobrar')) multiplicador = 1;
        else if (nombreTipo.includes('pagar')) multiplicador = -1;
        else if (['INGRESO', 'VENTA', 'COBRO'].includes(tipoCuenta)) multiplicador = 1; 
        else if (['GASTO', 'EGRESO', 'COMPRA', 'PAGO', 'PASIVO', 'ACTIVO'].includes(tipoCuenta)) multiplicador = -1;
        else if (tipoCuenta === 'CAPITAL') {
            if (nombreTipo.includes('aporte') || descripcionDetalle.includes('aporte')) multiplicador = 1;
        }

        const montoFinal = montoOperacion * multiplicador;
        if (esCaja) caja += montoFinal;
        if (esBanco) banco += montoFinal;

        const textoCompleto = `${nombreTipo} ${descripcionDetalle}`;
        if (esCaja && multiplicador === -1 && (textoCompleto.includes('deposito') || textoCompleto.includes('banco'))) banco += montoOperacion;
        if (esBanco && multiplicador === -1 && (textoCompleto.includes('retiro') || textoCompleto.includes('caja'))) caja += montoOperacion;
    });

    saldos.value = { caja, banco };
};

// --- API ---
const cargarTiposOperacion = async () => {
  try {
    const response = await api.get('/tipos-transaccion');
    if (response.data.success) tiposDeOperacion.value = response.data.data;
  } catch (error) { console.error('Error cargando tipos:', error); }
};

const cargarTransacciones = async () => {
  try {
    const response = await api.get('/transacciones');
    if (response.data.success) {
        transacciones.value = response.data.data || [];
        calcularSaldosActuales(transacciones.value);
    }
  } catch (error) {}
};

// --- GUARDAR ---
const guardarOperacion = async () => {
  if (mensajeAdvertenciaSaldo.value) {
      alert('⚠️ ' + mensajeAdvertenciaSaldo.value);
      return; 
  }

  if (!nuevaOperacion.value.descripcion || !nuevaOperacion.value.monto || !nuevaOperacion.value.id_tipo_transaccion) {
    alert('Complete los campos obligatorios'); return;
  }

  if ((esCuentaPorPagar.value || esCuentaPorCobrar.value) && !nuevaOperacion.value.fechaVencimiento) {
    alert('Al ser una cuenta por pagar/cobrar, debe indicar la Fecha de Vencimiento.'); return;
  }

  try {
    const tipo = tipoSeleccionado.value;
    const codigoDelTipo = tipo.id_tipo_transaccion_fk || 'SIN-CODIGO'; 
    const esIngreso = ['INGRESO', 'CAPITAL', 'VENTA'].includes(tipo.tipo_cuenta);
    const monto = parseFloat(nuevaOperacion.value.monto);
    
    const porPagar = esCuentaPorPagar.value ? 1 : 0;
    const porCobrar = esCuentaPorCobrar.value ? 1 : 0;
    const fVencimiento = (porPagar || porCobrar) ? nuevaOperacion.value.fechaVencimiento : null;
    const pagoSeleccionado = nuevaOperacion.value.metodoPago;

    const detallesPayload = [];

    if (esIngreso) {
        detallesPayload.push({
            debe: monto, haber: 0,
            descripcion_detalle: `${nuevaOperacion.value.descripcion} (${pagoSeleccionado})`,
            es_cuenta_por_cobrar: 0, es_cuenta_por_pagar: 0,
            Tipo_de_pago: pagoSeleccionado
        });
        detallesPayload.push({
            debe: 0, haber: monto,
            descripcion_detalle: tipo.nombre_tipo,
            es_cuenta_por_cobrar: porCobrar, es_cuenta_por_pagar: porPagar, 
            fecha_vencimiento: fVencimiento,
            Tipo_de_pago: pagoSeleccionado
        });
    } else {
        detallesPayload.push({
            debe: monto, haber: 0,
            descripcion_detalle: tipo.nombre_tipo,
            es_cuenta_por_cobrar: porCobrar, es_cuenta_por_pagar: porPagar,
            fecha_vencimiento: fVencimiento,
            Tipo_de_pago: pagoSeleccionado
        });
        detallesPayload.push({
            debe: 0, haber: monto,
            descripcion_detalle: `${nuevaOperacion.value.descripcion} (${pagoSeleccionado})`,
            es_cuenta_por_cobrar: 0, es_cuenta_por_pagar: 0,
            Tipo_de_pago: pagoSeleccionado
        });
    }

    const payload = {
      id_tipo_transaccion_fk: nuevaOperacion.value.id_tipo_transaccion, 
      fecha_asiento: nuevaOperacion.value.fecha,
      Tipo_de_pago: pagoSeleccionado,
      codigo_transaccion: codigoDelTipo, 
      detalles: detallesPayload      
    };

    await api.post('/transacciones', payload);
    await cargarTransacciones();
    cerrarModal();

  } catch (error) {
    alert('Error al guardar: ' + (error.response?.data?.message || error.message));
  }
};

const cambiarEstadoTransaccion = async (transaccion) => {
    const esCxP = transaccion.detalles.some(d => d.es_cuenta_por_pagar == 1);
    const esCxC = transaccion.detalles.some(d => d.es_cuenta_por_cobrar == 1);
    
    let mensajeTipo = '';
    if (esCxP) mensajeTipo = 'PAGADA (Saldar deuda)';
    else if (esCxC) mensajeTipo = 'COBRADA (Recibir dinero)';
    else return;

    const confirmacion = confirm(`¿Cambiar estado a COMPLETADO?\n\nAcción: Marcar como ${mensajeTipo}.`);
    if (confirmacion) {
        try {
            await api.put(`/transacciones/${transaccion.id_transaccion}/estado`);
            await cargarTransacciones();
            alert('Estado actualizado.');
        } catch (error) {
            console.error(error);
            alert('Error al actualizar.');
        }
    }
};

const esPendiente = (trx) => {
    if (!trx.detalles) return false;
    return trx.detalles.some(d => d.es_cuenta_por_pagar == 1 || d.es_cuenta_por_cobrar == 1);
};

const calcularMontoTotal = (detalles) => {
  if (!detalles || detalles.length === 0) return 0;
  return detalles.reduce((sum, d) => sum + parseFloat(d.debe || 0), 0);
};

const abrirModal = () => {
  nuevaOperacion.value = {
    descripcion: '', monto: '', fecha: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    id_tipo_transaccion: '', metodoPago: 'Bolívares'
  };
  modalInstancia.show();
};
const cerrarModal = () => modalInstancia.hide();

onMounted(async () => {
  const modalEl = document.getElementById('modalOperacion');
  if(modalEl) modalInstancia = new Modal(modalEl);
  
  await cargarTiposOperacion(); 
  await cargarTransacciones(); 
});
</script>

<template>
  <Side />
  <div class="main-content">
    
    <div class="header-section mb-4 p-4 rounded-3 shadow-sm d-flex justify-content-between align-items-center">
      <div class="text-white">
        <h2 class="fw-bold mb-1"><i class="fas fa-cash-register me-2"></i>Registro de Operaciones</h2>
        <p class="mb-0 opacity-75">Gestión de Transacciones Contables</p>
      </div>
      <div>
        <button @click="cargarTransacciones" class="btn btn-outline-light me-2"><i class="fas fa-sync-alt"></i></button>
        <button @click="abrirModal" class="btn btn-light text-primary fw-bold shadow"><i class="fas fa-plus-circle me-2"></i>Nueva Transacción</button>
      </div>
    </div>

    <div class="card border-0 shadow">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h6 class="fw-bold mb-0 text-secondary"><i class="fas fa-list me-2"></i>Libro de Movimientos</h6>
        <div class="input-group w-auto">
            <span class="input-group-text bg-light"><i class="fas fa-search"></i></span>
            <input v-model="filtroBusqueda" type="text" class="form-control bg-light" placeholder="Buscar...">
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">Fecha</th>
                <th>Descripción</th>
                <th>Clasificación</th>
                <th class="text-end pe-4">Monto Total</th>
                <th class="text-center">Estado / Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!operacionesFiltradas || operacionesFiltradas.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">No hay datos</td>
              </tr>
              
              <tr v-for="t in operacionesFiltradas" :key="t.id_transaccion">
                <td class="ps-4 text-secondary">
                    {{ t.fecha_asiento ? new Date(t.fecha_asiento).toLocaleDateString() : 'N/A' }}
                </td>
                <td>
                    <span class="fw-bold d-block">{{ t.detalles?.[0]?.descripcion_detalle || 'Sin descripción' }}</span>
                    <small class="text-muted">Ref: TRX-{{ t.id_transaccion }}</small>
                </td>
                <td>
                    <span class="badge border" :class="obtenerColorBadge(t.tipo_transaccion?.tipo_cuenta)">
                        {{ t.tipo_transaccion?.nombre_tipo || 'General' }}
                    </span>
                    <span v-if="t.detalles?.some(d => d.es_cuenta_por_pagar == 1)" class="badge bg-warning text-dark ms-1">
                        <i class="fas fa-clock me-1"></i>Por Pagar
                    </span>
                    <span v-if="t.detalles?.some(d => d.es_cuenta_por_cobrar == 1)" class="badge bg-info text-dark ms-1">
                        <i class="fas fa-clock me-1"></i>Por Cobrar
                    </span>
                </td>
                <td class="text-end pe-4 fw-bold">
                    {{ formatoMoneda(calcularMontoTotal(t.detalles)) }}
                </td>
                
                <td class="text-center">
                    <button v-if="esPendiente(t)" 
                            @click="cambiarEstadoTransaccion(t)" 
                            class="btn btn-outline-success btn-sm fw-bold shadow-sm"
                            title="Marcar como Completado / Saldado">
                        <i class="fas fa-check-circle me-1"></i> Completar
                    </button>

                    <span v-else class="text-success small fw-bold">
                        <i class="fas fa-check-double"></i> Procesado
                    </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modalOperacion" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-bold">Registrar Operación</h5>
          <button type="button" class="btn-close btn-close-white" @click="cerrarModal"></button>
        </div>
        <div class="modal-body p-4">
          <form @submit.prevent="guardarOperacion">
            
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted">Categoría Contable</label>
              <select v-model="nuevaOperacion.id_tipo_transaccion" class="form-select border-primary" required>
                <option value="" disabled>Seleccione una opción...</option>
                <option v-for="tipo in tiposDeOperacion" 
                        :key="tipo.id_tipo_transaccion || tipo.id_tipo_transaccion_pk" 
                        :value="tipo.id_tipo_transaccion || tipo.id_tipo_transaccion_pk">
                  {{ tipo.nombre_tipo }} ({{ tipo.tipo_cuenta }})
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold text-muted">Descripción</label>
              <input v-model="nuevaOperacion.descripcion" type="text" class="form-control" required>
            </div>
            
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label small fw-bold text-muted">Monto (Bs.)</label>
                <input v-model="nuevaOperacion.monto" type="number" step="0.01" 
                       class="form-control fw-bold" 
                       :class="{ 'is-invalid': mensajeAdvertenciaSaldo }" 
                       required>
                
                <small v-if="mensajeAdvertenciaSaldo" class="text-danger fw-bold d-block mt-1 animate__animated animate__fadeIn">
                    {{ mensajeAdvertenciaSaldo }}
                </small>
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold text-muted">Fecha Emisión</label>
                <input v-model="nuevaOperacion.fecha" type="date" class="form-control" required>
              </div>
            </div>

            <div v-if="esCuentaPorPagar || esCuentaPorCobrar" class="mb-3 bg-light p-3 rounded border border-warning">
                <label class="form-label small fw-bold text-dark">
                    <i class="fas fa-calendar-times me-1 text-warning"></i> 
                    Fecha de Vencimiento 
                </label>
                <input v-model="nuevaOperacion.fechaVencimiento" type="date" class="form-control border-warning" required>
            </div>

            <div class="mb-4">
                <label class="form-label small fw-bold text-muted">Método de Pago</label>
                <select v-model="nuevaOperacion.metodoPago" class="form-select">
                    <option v-for="m in metodosPago" :key="m" :value="m">{{ m }}</option>
                </select>
            </div>

            <div class="d-grid">
              <button type="submit" class="btn btn-primary fw-bold" :disabled="!!mensajeAdvertenciaSaldo">
                  Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  margin-left: 260px; 
  padding: 2rem;
  min-height: 100vh;
  background-color: #f8f9fa;
  margin-top: 0 !important;
  padding-top: 1rem;
}
.header-section {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
}
@media (max-width: 992px) {
  .main-content { margin-left: 0; padding: 1rem; }
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate__fadeIn {
    animation: fadeIn 0.3s ease-in-out;
}
</style>