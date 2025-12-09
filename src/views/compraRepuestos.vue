<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import api from '../backend/services/api.js';

// --- ESTADO ---
const comprasRepuestos = ref([]);
const repuestos = ref([]);
const proveedores = ref([]);
const tiposDeOperacion = ref([]); // Nuevo: para tipos contables
const saldos = ref({ caja: 0, banco: 0 }); // Nuevo: para validación de saldo
const filtroBusqueda = ref('');
let modalInstancia = null;

// Función auxiliar para obtener fecha local
const obtenerFechaLocal = () => {
  const fecha = new Date();
  const offset = fecha.getTimezoneOffset() * 60000;
  return new Date(fecha - offset).toISOString().split('T')[0];
};

// Métodos de pago (igual que en gestión y gastos)
const metodosPago = ['Bolívares', 'Punto de Venta', 'Pago Móvil', 'Transferencia', 'Crédito'];

// Modelo del formulario de compra (ampliado)
const nuevaCompra = ref({
  id_repuesto: '',
  id_proveedor: '',
  cantidad_comprada: '',
  precio_unitario_compra: '',
  fecha_compra: obtenerFechaLocal(),
  // Nuevos campos para transacción contable:
  id_tipo_transaccion: '',
  metodoPago: 'Bolívares',
  descripcion: '',
  fechaVencimiento: ''
});

// Campos calculados
const totalCompra = computed(() => {
  const cantidad = parseFloat(nuevaCompra.value.cantidad_comprada) || 0;
  const precio = parseFloat(nuevaCompra.value.precio_unitario_compra) || 0;
  return cantidad * precio;
});

// Computed para obtener el tipo de cuenta seleccionado
const tipoSeleccionado = computed(() => {
  if (!tiposDeOperacion.value) return undefined;
  return tiposDeOperacion.value.find(t => 
    t.id_tipo_transaccion === nuevaCompra.value.id_tipo_transaccion || 
    t.id_tipo_transaccion_pk === nuevaCompra.value.id_tipo_transaccion
  );
});

// Computed para verificar si es cuenta por pagar
const esCuentaPorPagar = computed(() => {
  if (!tipoSeleccionado.value) return false;
  const nombre = (tipoSeleccionado.value.nombre_tipo || '').toLowerCase();
  const tipo = (tipoSeleccionado.value.tipo_cuenta || '').toUpperCase();
  return nombre.includes('pagar') || nombre.includes('proveedor') || (tipo === 'PASIVO' && !nombre.includes('capital'));
});

// Computed para validación de saldo (igual que en gestión y gastos)
const mensajeAdvertenciaSaldo = computed(() => {
  const monto = totalCompra.value || 0;
  if (monto <= 0) return null;

  const tipo = tipoSeleccionado.value;
  if (!tipo) return null;
  
  // Compras de repuestos son siempre salidas de dinero
  const esSalida = ['GASTO', 'EGRESO', 'COMPRA', 'PAGO', 'PASIVO', 'ACTIVO'].includes((tipo.tipo_cuenta || '').toUpperCase());
  
  if (!esSalida || esCuentaPorPagar.value || nuevaCompra.value.metodoPago === 'Crédito') {
    return null;
  }

  const metodo = nuevaCompra.value.metodoPago;
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

// Formato de moneda (igual que en gestión y gastos)
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

// --- CARGAR DATOS ---
const cargarRepuestos = async () => {
  try {
    const response = await api.get('/repuestos/obtenerRep');
    if (response.data && response.data.repuestos) {
      repuestos.value = response.data.repuestos;
    } else if (Array.isArray(response.data)) {
      repuestos.value = response.data;
    } else {
      repuestos.value = [];
    }
  } catch (error) {
    console.error('Error cargando repuestos:', error);
    repuestos.value = [];
  }
};

const cargarProveedores = async () => {
  try {
    const response = await api.get('/proveedores/obtenerPro');
    if (response.data && response.data.proveedores) {
      proveedores.value = response.data.proveedores;
    } else if (Array.isArray(response.data)) {
      proveedores.value = response.data;
    } else {
      proveedores.value = [];
    }
  } catch (error) {
    console.error('Error cargando proveedores:', error);
    proveedores.value = [];
  }
};

// Nuevo: cargar tipos de operación
const cargarTiposOperacion = async () => {
  try {
    const response = await api.get('/tipos-transaccion');
    if (response.data.success) {
      // Filtrar para mostrar solo tipos relacionados con compras/mercancía
      tiposDeOperacion.value = response.data.data.filter(t => 
        ['GASTO', 'EGRESO', 'COMPRA', 'ACTIVO'].includes((t.tipo_cuenta || '').toUpperCase()) ||
        (t.nombre_tipo || '').toLowerCase().includes('repuesto') ||
        (t.nombre_tipo || '').toLowerCase().includes('mercancía') ||
        (t.nombre_tipo || '').toLowerCase().includes('inventario')
      );
    }
  } catch (error) { 
    console.error('Error cargando tipos:', error); 
  }
};

// Nuevo: calcular saldos (igual que en gestión y gastos)
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

// Nuevo: cargar transacciones para calcular saldos
const cargarTransaccionesParaSaldos = async () => {
  try {
    const response = await api.get('/transacciones');
    if (response.data.success) {
      calcularSaldosActuales(response.data.data || []);
    }
  } catch (error) {
    console.error('Error cargando transacciones para saldos:', error);
  }
};

const cargarCompras = async () => {
  try {
    const response = await api.get('/compras/');
    
    if (response.data && response.data.compras) {
      comprasRepuestos.value = response.data.compras.map(compra => ({
        ...compra,
        repuesto_nombre: compra.repuesto?.nombre_repuesto || 'N/A',
        proveedor_nombre: compra.proveedor?.nombre_fiscal || 'N/A',
        total: compra.precio_unitario_compra * compra.cantidad_comprada
      }));
    } else if (Array.isArray(response.data)) {
      comprasRepuestos.value = response.data;
    } else {
      comprasRepuestos.value = [];
    }
  } catch (error) {
    console.error('Error cargando compras:', error);
    comprasRepuestos.value = [];
  }
};

// --- GUARDAR COMPRA ---
const guardarCompra = async () => {
  // Validaciones de la compra
  if (!nuevaCompra.value.id_repuesto || !nuevaCompra.value.id_proveedor || 
      !nuevaCompra.value.cantidad_comprada || !nuevaCompra.value.precio_unitario_compra) {
    alert('Complete los campos obligatorios: Repuesto, Proveedor, Cantidad y Precio Unitario');
    return;
  }

  // Validación de tipo de transacción
  if (!nuevaCompra.value.id_tipo_transaccion) {
    alert('Debe seleccionar una categoría contable');
    return;
  }

  // Validación de saldo (si aplica)
  if (mensajeAdvertenciaSaldo.value) {
    alert('⚠️ ' + mensajeAdvertenciaSaldo.value);
    return;
  }

  // Validación de fecha de vencimiento si es cuenta por pagar
  if (esCuentaPorPagar.value && !nuevaCompra.value.fechaVencimiento) {
    alert('Al ser una cuenta por pagar, debe indicar la Fecha de Vencimiento.');
    return;
  }

  const cantidad = parseInt(nuevaCompra.value.cantidad_comprada);
  const precio = parseFloat(nuevaCompra.value.precio_unitario_compra);
  const total = totalCompra.value;
  
  if (cantidad <= 0 || isNaN(cantidad)) {
    alert('La cantidad debe ser un número entero mayor a 0');
    return;
  }

  if (precio <= 0 || isNaN(precio)) {
    alert('El precio unitario debe ser mayor a 0');
    return;
  }

  try {
    // Preparar datos para la transacción contable
    const tipo = tipoSeleccionado.value;
    const codigoDelTipo = tipo.id_tipo_transaccion_fk || 'COMP-REP';
    const porPagar = esCuentaPorPagar.value ? 1 : 0;
    const fVencimiento = porPagar ? nuevaCompra.value.fechaVencimiento : null;
    const pagoSeleccionado = nuevaCompra.value.metodoPago;
    
    // Obtener nombres para la descripción
    const repuestoNombre = repuestos.value.find(r => r.id_repuesto === nuevaCompra.value.id_repuesto)?.nombre_repuesto || 'Repuesto';
    const proveedorNombre = proveedores.value.find(p => p.id_proveedor === nuevaCompra.value.id_proveedor)?.nombre_fiscal || 'Proveedor';
    
    const descripcion = nuevaCompra.value.descripcion || `Compra de ${repuestoNombre} a ${proveedorNombre}`;

    // Crear detalles de la transacción (similar a gestión y gastos)
    const detallesPayload = [
      {
        debe: total,
        haber: 0,
        descripcion_detalle: tipo.nombre_tipo,
        es_cuenta_por_cobrar: 0,
        es_cuenta_por_pagar: porPagar,
        fecha_vencimiento: fVencimiento,
        Tipo_de_pago: pagoSeleccionado
      },
      {
        debe: 0,
        haber: total,
        descripcion_detalle: `${descripcion} (${pagoSeleccionado})`,
        es_cuenta_por_cobrar: 0,
        es_cuenta_por_pagar: 0,
        Tipo_de_pago: pagoSeleccionado
      }
    ];

    // Payload para la transacción contable
    const payloadTransaccion = {
      id_tipo_transaccion_fk: nuevaCompra.value.id_tipo_transaccion,
      fecha_asiento: nuevaCompra.value.fecha_compra,
      Tipo_de_pago: pagoSeleccionado,
      codigo_transaccion: codigoDelTipo,
      detalles: detallesPayload
    };

    // 1. Primero registrar la transacción contable
    const responseTransaccion = await api.post('/transacciones', payloadTransaccion);
    
    if (responseTransaccion.data.success) {
      // 2. Luego registrar la compra en el sistema de repuestos
      const payloadCompra = {
        id_repuesto: nuevaCompra.value.id_repuesto,
        id_proveedor: nuevaCompra.value.id_proveedor,
        cantidad_comprada: cantidad,
        precio_unitario_compra: precio,
        fecha_compra: nuevaCompra.value.fecha_compra,
        // Opcional: vincular con la transacción contable
        id_transaccion_asociada: responseTransaccion.data.data?.id_transaccion
      };

      console.log('Enviando compra:', payloadCompra);
      const responseCompra = await api.post('/compras/', payloadCompra);
      
      if (responseCompra.status === 201 || responseCompra.data.success) {
        // Actualizar listas y saldos
        await cargarCompras();
        await cargarRepuestos();
        await cargarTransaccionesParaSaldos();
        
        cerrarModal();
        alert('✅ Compra registrada exitosamente. Se registró la transacción contable y el stock se actualizó automáticamente.');
      } else {
        throw new Error(responseCompra.data.message || 'Error al guardar compra');
      }
    } else {
      throw new Error(responseTransaccion.data.message || 'Error al registrar transacción contable');
    }
  } catch (error) {
    console.error('Error al guardar compra:', error);
    alert('❌ Error al guardar la compra: ' + (error.response?.data?.message || error.message));
  }
};

// --- ELIMINAR COMPRA ---
const eliminarCompra = async (id, idTransaccion) => {
  if (confirm('¿Está seguro de eliminar esta compra? Esto revertirá el stock del repuesto y eliminará la transacción contable asociada.')) {
    try {
      // 1. Eliminar la transacción contable (si existe)
      if (idTransaccion) {
        try {
          await api.delete(`/transacciones/${idTransaccion}`);
        } catch (transError) {
          console.warn('No se pudo eliminar la transacción contable:', transError);
        }
      }
      
      // 2. Eliminar la compra
      await api.delete('/compras/', {
        data: { id_compra_repuesto: id }
      });
      
      await cargarCompras();
      await cargarRepuestos();
      await cargarTransaccionesParaSaldos();
      
      alert('Compra eliminada exitosamente');
    } catch (error) {
      alert('Error al eliminar la compra: ' + (error.response?.data?.message || error.message));
    }
  }
};

// --- FUNCIONES AUXILIARES ---
const obtenerNombreRepuesto = (id) => {
  if (!id) return 'N/A';
  const compra = comprasRepuestos.value.find(c => 
    c.id_compra_repuesto === id || c.id_repuesto === id
  );
  return compra?.repuesto_nombre || repuestos.value.find(r => r.id_repuesto === id)?.nombre_repuesto || 'N/A';
};

const obtenerNombreProveedor = (id) => {
  if (!id) return 'N/A';
  const compra = comprasRepuestos.value.find(c => 
    c.id_compra_repuesto === id || c.id_proveedor === id
  );
  return compra?.proveedor_nombre || proveedores.value.find(p => p.id_proveedor === id)?.nombre_fiscal || 'N/A';
};

const obtenerStockRepuesto = (id) => {
  if (!id) return 0;
  const repuesto = repuestos.value.find(r => r.id_repuesto === id);
  return repuesto ? (parseInt(repuesto.stock_inventario) || 0) : 0;
};

const abrirModal = () => {
  nuevaCompra.value = {
    id_repuesto: '',
    id_proveedor: '',
    cantidad_comprada: '',
    precio_unitario_compra: '',
    fecha_compra: obtenerFechaLocal(),
    id_tipo_transaccion: '',
    metodoPago: 'Bolívares',
    descripcion: '',
    fechaVencimiento: ''
  };
  if (modalInstancia) modalInstancia.show();
};

const cerrarModal = () => {
  if (modalInstancia) modalInstancia.hide();
};

// Cuando se selecciona un repuesto, cargar su precio actual
const onRepuestoSeleccionado = () => {
  if (nuevaCompra.value.id_repuesto) {
    const repuesto = repuestos.value.find(r => r.id_repuesto === nuevaCompra.value.id_repuesto);
    if (repuesto && repuesto.precio_unitario && !nuevaCompra.value.precio_unitario_compra) {
      nuevaCompra.value.precio_unitario_compra = repuesto.precio_unitario;
    }
    
    // Auto-completar descripción si está vacía
    if (!nuevaCompra.value.descripcion && repuesto) {
      nuevaCompra.value.descripcion = `Compra de ${repuesto.nombre_repuesto}`;
    }
  }
};

// Filtrar compras
const comprasFiltradas = computed(() => {
  if (!filtroBusqueda.value) return comprasRepuestos.value;
  const texto = filtroBusqueda.value.toLowerCase();
  return comprasRepuestos.value.filter(c => {
    const repuestoNombre = obtenerNombreRepuesto(c.id_repuesto).toLowerCase();
    const proveedorNombre = obtenerNombreProveedor(c.id_proveedor).toLowerCase();
    
    return (
      repuestoNombre.includes(texto) ||
      proveedorNombre.includes(texto)
    );
  });
});

// Ordenar repuestos por nombre
const repuestosOrdenados = computed(() => {
  return [...repuestos.value].sort((a, b) => 
    (a.nombre_repuesto || '').localeCompare(b.nombre_repuesto || '')
  );
});

// Ordenar proveedores por nombre
const proveedoresOrdenados = computed(() => {
  return [...proveedores.value].sort((a, b) => 
    (a.nombre_fiscal || '').localeCompare(b.nombre_fiscal || '')
  );
});

// Ordenar tipos de operación por nombre
const tiposOperacionOrdenados = computed(() => {
  return [...tiposDeOperacion.value].sort((a, b) => 
    (a.nombre_tipo || '').localeCompare(b.nombre_tipo || '')
  );
});

onMounted(async () => {
  modalInstancia = new Modal(document.getElementById('modalCompra'));
  await cargarTiposOperacion();
  await cargarTransaccionesParaSaldos();
  await cargarRepuestos();
  await cargarProveedores();
  await cargarCompras();
});
</script>

<template>
  <Side />
  <div class="main-content">
    
    <div class="header-section mb-4 p-4 rounded-3 shadow-sm d-flex justify-content-between align-items-center">
      <div class="text-white">
        <h2 class="fw-bold mb-1"><i class="fas fa-shopping-cart me-2"></i>Compras de Repuestos</h2>
        <p class="mb-0 opacity-75">Gestión de compras - Registro contable integrado</p>
      </div>
      <div>
        <button @click="cargarCompras" class="btn btn-outline-light me-2" title="Actualizar lista">
          <i class="fas fa-sync-alt"></i>
        </button>
        <button @click="abrirModal" class="btn btn-light text-primary fw-bold shadow">
          <i class="fas fa-plus-circle me-2"></i>Nueva Compra
        </button>
      </div>
    </div>

    <!-- Resumen de stock y saldos -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 opacity-75">Repuestos</h6>
                <h4 class="card-title fw-bold">{{ repuestos.length }}</h4>
              </div>
              <i class="fas fa-boxes fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 opacity-75">Saldo Caja</h6>
                <h4 class="card-title fw-bold">{{ formatoMoneda(saldos.caja) }}</h4>
              </div>
              <i class="fas fa-money-bill-wave fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 opacity-75">Saldo Banco</h6>
                <h4 class="card-title fw-bold">{{ formatoMoneda(saldos.banco) }}</h4>
              </div>
              <i class="fas fa-university fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2">Inversión Total</h6>
                <h4 class="card-title fw-bold">
                  {{ formatoMoneda(comprasRepuestos.reduce((sum, c) => sum + (c.total || 0), 0)) }}
                </h4>
              </div>
              <i class="fas fa-dollar-sign fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de compras -->
    <div class="card border-0 shadow">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h6 class="fw-bold mb-0 text-secondary">
          <i class="fas fa-list me-2"></i>Historial de Compras
        </h6>
        <div class="input-group w-auto">
          <span class="input-group-text bg-light"><i class="fas fa-search"></i></span>
          <input v-model="filtroBusqueda" type="text" class="form-control bg-light" placeholder="Buscar repuesto o proveedor...">
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">ID</th>
                <th>Fecha</th>
                <th>Repuesto</th>
                <th>Proveedor</th>
                <th class="text-center">Cantidad</th>
                <th class="text-end">Total</th>
                <th class="text-center">Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="comprasFiltradas.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fas fa-inbox fa-2x mb-3 d-block"></i>
                  No hay compras registradas
                </td>
              </tr>
              <tr v-for="compra in comprasFiltradas" :key="compra.id_compra_repuesto">
                <td class="ps-4 text-secondary small">
                  #{{ compra.id_compra_repuesto }}
                </td>
                <td class="text-secondary">
                  {{ new Date(compra.fecha_compra).toLocaleDateString() }}
                </td>
                <td>
                  <span class="fw-bold d-block">
                    {{ compra.repuesto_nombre || obtenerNombreRepuesto(compra.id_repuesto) }}
                  </span>
                  <small class="text-muted">ID: {{ compra.id_repuesto }}</small>
                </td>
                <td>
                  <div class="fw-bold">{{ compra.proveedor_nombre || obtenerNombreProveedor(compra.id_proveedor) }}</div>
                  <small class="text-muted">ID: {{ compra.id_proveedor }}</small>
                </td>
                <td class="text-center">
                  <span class="badge bg-primary rounded-pill px-3 py-1">
                    {{ compra.cantidad_comprada }}
                  </span>
                </td>
                <td class="text-end fw-bold text-success">
                  {{ formatoMoneda(compra.total || (compra.cantidad_comprada * compra.precio_unitario_compra)) }}
                </td>
                <td class="text-center">
                  <span class="badge bg-success">
                    <i class="fas fa-check-circle me-1"></i> Contabilizado
                  </span>
                </td>
                <td class="text-center">
                  <button @click="eliminarCompra(compra.id_compra_repuesto, compra.id_transaccion_asociada)" 
                          class="btn btn-sm btn-outline-danger" 
                          title="Eliminar compra">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para nueva compra -->
  <div class="modal fade" id="modalCompra" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title fw-bold">Registrar Nueva Compra</h5>
          <button type="button" class="btn-close btn-close-white" @click="cerrarModal"></button>
        </div>
        <div class="modal-body p-4">
          <form @submit.prevent="guardarCompra">
            <div class="row g-3">
              <!-- Sección 1: Datos de la compra -->
              <div class="col-md-6">
                <h6 class="fw-bold text-success mb-3">
                  <i class="fas fa-shopping-cart me-2"></i>Datos de la Compra
                </h6>
                
                <!-- Repuesto -->
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted">
                    <i class="fas fa-cog me-1"></i>Repuesto *
                  </label>
                  <select v-model="nuevaCompra.id_repuesto" 
                          @change="onRepuestoSeleccionado"
                          class="form-select border-success" 
                          required>
                    <option value="" disabled>Seleccione un repuesto...</option>
                    <option v-for="repuesto in repuestosOrdenados" 
                            :key="repuesto.id_repuesto" 
                            :value="repuesto.id_repuesto">
                      {{ repuesto.nombre_repuesto }} 
                      <span v-if="repuesto.stock_inventario !== undefined">
                        (Stock: {{ repuesto.stock_inventario }})
                      </span>
                    </option>
                  </select>
                  <div v-if="nuevaCompra.id_repuesto" class="form-text">
                    Stock actual: <strong>{{ obtenerStockRepuesto(nuevaCompra.id_repuesto) }}</strong>
                  </div>
                </div>

                <!-- Proveedor -->
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted">
                    <i class="fas fa-truck me-1"></i>Proveedor *
                  </label>
                  <select v-model="nuevaCompra.id_proveedor" 
                          class="form-select border-success" 
                          required>
                    <option value="" disabled>Seleccione un proveedor...</option>
                    <option v-for="proveedor in proveedoresOrdenados" 
                            :key="proveedor.id_proveedor" 
                            :value="proveedor.id_proveedor">
                      {{ proveedor.nombre_fiscal }}
                    </option>
                  </select>
                </div>

                <!-- Descripción -->
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted">
                    <i class="fas fa-file-alt me-1"></i>Descripción
                  </label>
                  <input v-model="nuevaCompra.descripcion" 
                         type="text" 
                         class="form-control border-success" 
                         placeholder="Descripción de la compra...">
                </div>
              </div>

              <!-- Sección 2: Datos contables -->
              <div class="col-md-6">
                <h6 class="fw-bold text-primary mb-3">
                  <i class="fas fa-book me-2"></i>Datos Contables
                </h6>
                
                <!-- Categoría Contable -->
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted">Categoría Contable *</label>
                  <select v-model="nuevaCompra.id_tipo_transaccion" 
                          class="form-select border-primary" 
                          required>
                    <option value="" disabled>Seleccione una opción...</option>
                    <option v-for="tipo in tiposOperacionOrdenados" 
                            :key="tipo.id_tipo_transaccion || tipo.id_tipo_transaccion_pk" 
                            :value="tipo.id_tipo_transaccion || tipo.id_tipo_transaccion_pk">
                      {{ tipo.nombre_tipo }} ({{ tipo.tipo_cuenta }})
                    </option>
                  </select>
                </div>

                <!-- Método de Pago -->
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted">Método de Pago *</label>
                  <select v-model="nuevaCompra.metodoPago" 
                          class="form-select border-primary">
                    <option v-for="m in metodosPago" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>

                <!-- Fecha de Vencimiento (solo si es cuenta por pagar) -->
                <div v-if="esCuentaPorPagar" class="mb-3">
                  <label class="form-label small fw-bold text-dark">
                    <i class="fas fa-calendar-times me-1 text-warning"></i> 
                    Fecha de Vencimiento *
                  </label>
                  <input v-model="nuevaCompra.fechaVencimiento" 
                         type="date" 
                         class="form-control border-warning" 
                         required>
                </div>

                <!-- Fecha Compra -->
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted">
                    <i class="fas fa-calendar me-1"></i>Fecha Compra
                  </label>
                  <input v-model="nuevaCompra.fecha_compra" 
                         type="date" 
                         class="form-control border-primary" 
                         required>
                </div>
              </div>

              <!-- Sección 3: Cantidad y Precio -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted">
                    <i class="fas fa-boxes me-1"></i>Cantidad *
                  </label>
                  <input v-model="nuevaCompra.cantidad_comprada" 
                         type="number" 
                         min="1" 
                         step="1" 
                         class="form-control border-success fw-bold" 
                         placeholder="Ej: 10"
                         required>
                  <div class="form-text">Unidades a comprar</div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted">
                    <i class="fas fa-dollar-sign me-1"></i>Precio Unitario *
                  </label>
                  <input v-model="nuevaCompra.precio_unitario_compra" 
                         type="number" 
                         min="0.01" 
                         step="0.01" 
                         class="form-control border-success fw-bold" 
                         placeholder="Ej: 25.50"
                         required>
                  <div class="form-text">Precio por unidad</div>
                </div>
              </div>

              <!-- Advertencia de saldo -->
              <div v-if="mensajeAdvertenciaSaldo" class="col-12">
                <div class="alert alert-warning animate__animated animate__fadeIn">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ mensajeAdvertenciaSaldo }}
                </div>
              </div>

              <!-- Resumen de la compra -->
              <div class="col-12 mt-3">
                <div class="card border-success">
                  <div class="card-header bg-light-success border-success">
                    <h6 class="mb-0 fw-bold text-success">
                      <i class="fas fa-calculator me-2"></i>Resumen de la Compra
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="d-flex justify-content-between mb-2">
                          <span class="text-muted">Cantidad:</span>
                          <span class="fw-bold">{{ nuevaCompra.cantidad_comprada || 0 }} unidades</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                          <span class="text-muted">Precio unitario:</span>
                          <span class="fw-bold">{{ formatoMoneda(nuevaCompra.precio_unitario_compra) }}</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between">
                          <span class="text-muted fw-bold">Total:</span>
                          <span class="fw-bold fs-5 text-success">{{ formatoMoneda(totalCompra) }}</span>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div v-if="tipoSeleccionado" class="alert alert-info mb-0">
                          <h6 class="fw-bold">
                            <i class="fas fa-book me-2"></i>
                            Registro Contable
                          </h6>
                          <p class="mb-1">
                            <strong>Categoría:</strong> {{ tipoSeleccionado.nombre_tipo }}
                          </p>
                          <p class="mb-1">
                            <strong>Tipo:</strong> {{ tipoSeleccionado.tipo_cuenta }}
                          </p>
                          <p class="mb-1">
                            <strong>Método:</strong> {{ nuevaCompra.metodoPago }}
                          </p>
                          <p v-if="esCuentaPorPagar" class="mb-0 text-warning">
                            <i class="fas fa-clock me-1"></i>
                            Esta compra se registrará como cuenta por pagar
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="nuevaCompra.id_repuesto" class="alert alert-info mt-3 mb-0 py-2">
                      <i class="fas fa-info-circle me-2"></i>
                      <small>
                        Stock actual: <strong>{{ obtenerStockRepuesto(nuevaCompra.id_repuesto) }}</strong> → 
                        Stock nuevo: <strong>{{ obtenerStockRepuesto(nuevaCompra.id_repuesto) + (parseInt(nuevaCompra.cantidad_comprada) || 0) }}</strong>
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botón de guardar -->
              <div class="col-12 mt-3">
                <div class="d-grid">
                  <button type="submit" 
                          class="btn btn-success fw-bold py-3"
                          :disabled="!!mensajeAdvertenciaSaldo">
                    <i class="fas fa-save me-2"></i>
                    Registrar Compra y Transacción Contable
                  </button>
                </div>
              </div>
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
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.bg-light-success {
  background-color: rgba(40, 167, 69, 0.1) !important;
}

.card {
  transition: transform 0.2s;
  border-radius: 10px;
}

.card:hover {
  transform: translateY(-2px);
}

.table th {
  background-color: #f8f9fa;
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.table td {
  vertical-align: middle;
}

.badge.bg-primary {
  background-color: #007bff !important;
}

.form-select, .form-control {
  border-radius: 8px;
  border: 2px solid #dee2e6;
  transition: border-color 0.2s;
}

.form-select:focus, .form-control:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
  border-radius: 8px;
  padding: 10px 20px;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn-outline-danger {
  border-radius: 6px;
  padding: 5px 10px;
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate__fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@media (max-width: 992px) {
  .main-content { 
    margin-left: 0; 
    padding: 1rem; 
  }
  
  .header-section {
    flex-direction: column;
    text-align: center;
  }
  
  .header-section > div:first-child {
    margin-bottom: 1rem;
  }
  
  .modal-dialog {
    margin: 1rem;
  }
}
</style>