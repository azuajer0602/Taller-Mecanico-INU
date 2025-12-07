<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import api from '../backend/services/api.js';

// --- ESTADO ---
const comprasRepuestos = ref([]);
const repuestos = ref([]);
const proveedores = ref([]);
const filtroBusqueda = ref('');
let modalInstancia = null;

// Función auxiliar para obtener fecha local
const obtenerFechaLocal = () => {
  const fecha = new Date();
  const offset = fecha.getTimezoneOffset() * 60000;
  return new Date(fecha - offset).toISOString().split('T')[0];
};

// Modelo del formulario de compra
const nuevaCompra = ref({
  id_repuesto: '',
  id_proveedor: '',
  cantidad_comprada: '',
  precio_unitario_compra: '',
  fecha_compra: obtenerFechaLocal(),
  // Eliminé numero_factura y observaciones porque no están en tu tabla
});

// Campos calculados
const totalCompra = computed(() => {
  const cantidad = parseFloat(nuevaCompra.value.cantidad_comprada) || 0;
  const precio = parseFloat(nuevaCompra.value.precio_unitario_compra) || 0;
  return cantidad * precio;
});

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

const cargarCompras = async () => {
  try {
    // Usando el endpoint del nuevo controlador
    const response = await api.get('/compras/');
    
    if (response.data && response.data.compras) {
      comprasRepuestos.value = response.data.compras.map(compra => ({
        ...compra,
        // Añadir nombres para mostrar
        repuesto_nombre: compra.repuesto?.nombre_repuesto || 'N/A',
        proveedor_nombre: compra.proveedor?.nombre_fiscal || 'N/A',
        // Calcular total si no viene
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
  // Validaciones
  if (!nuevaCompra.value.id_repuesto || !nuevaCompra.value.id_proveedor || 
      !nuevaCompra.value.cantidad_comprada || !nuevaCompra.value.precio_unitario_compra) {
    alert('Complete los campos obligatorios: Repuesto, Proveedor, Cantidad y Precio Unitario');
    return;
  }

  const cantidad = parseInt(nuevaCompra.value.cantidad_comprada);
  const precio = parseFloat(nuevaCompra.value.precio_unitario_compra);
  
  if (cantidad <= 0 || isNaN(cantidad)) {
    alert('La cantidad debe ser un número entero mayor a 0');
    return;
  }

  if (precio <= 0 || isNaN(precio)) {
    alert('El precio unitario debe ser mayor a 0');
    return;
  }

  try {
    // Preparar datos según tu tabla
    const payloadCompra = {
      id_repuesto: nuevaCompra.value.id_repuesto,
      id_proveedor: nuevaCompra.value.id_proveedor,
      cantidad_comprada: cantidad,
      precio_unitario_compra: precio,
      fecha_compra: nuevaCompra.value.fecha_compra
    };

    console.log('Enviando compra:', payloadCompra);

    // Enviar a tu nuevo endpoint
    const response = await api.post('/compras/', payloadCompra);
    
    if (response.status === 201 || response.data.success) {
      // Actualizar listas
      await cargarCompras();
      await cargarRepuestos(); // Para actualizar stock en la lista
      
      cerrarModal();
      alert('✅ Compra registrada exitosamente. El stock se actualizó automáticamente.');
    } else {
      throw new Error(response.data.message || 'Error al guardar compra');
    }
  } catch (error) {
    console.error('Error al guardar compra:', error);
    alert('❌ Error al guardar la compra: ' + (error.response?.data?.message || error.message));
  }
};

// --- ELIMINAR COMPRA ---
const eliminarCompra = async (id) => {
  if (confirm('¿Está seguro de eliminar esta compra? Esto revertirá el stock del repuesto.')) {
    try {
      // Enviar en el body como requiere tu controlador
      await api.delete('/compras/', {
        data: { id_compra_repuesto: id }
      });
      await cargarCompras();
      await cargarRepuestos();
      alert('Compra eliminada exitosamente');
    } catch (error) {
      alert('Error al eliminar la compra: ' + (error.response?.data?.message || error.message));
    }
  }
};

// --- FUNCIONES AUXILIARES ---
const formatoMoneda = (valor) => {
  return new Intl.NumberFormat('es-VE', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(valor || 0);
};

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

onMounted(async () => {
  modalInstancia = new Modal(document.getElementById('modalCompra'));
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
        <p class="mb-0 opacity-75">Gestión de compras - Stock se actualiza automáticamente</p>
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

    <!-- Resumen de stock -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 opacity-75">Repuestos Registrados</h6>
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
                <h6 class="card-subtitle mb-2 opacity-75">Proveedores</h6>
                <h4 class="card-title fw-bold">{{ proveedores.length }}</h4>
              </div>
              <i class="fas fa-truck fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 opacity-75">Compras Registradas</h6>
                <h4 class="card-title fw-bold">{{ comprasRepuestos.length }}</h4>
              </div>
              <i class="fas fa-receipt fa-2x opacity-50"></i>
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
                <th class="text-end">Precio Unit.</th>
                <th class="text-end">Total</th>
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
                <td class="text-end fw-bold">
                  {{ formatoMoneda(compra.precio_unitario_compra) }}
                </td>
                <td class="text-end fw-bold text-success">
                  {{ formatoMoneda(compra.total || (compra.cantidad_comprada * compra.precio_unitario_compra)) }}
                </td>
                <td class="text-center">
                  <button @click="eliminarCompra(compra.id_compra_repuesto)" 
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
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title fw-bold">Registrar Nueva Compra</h5>
          <button type="button" class="btn-close btn-close-white" @click="cerrarModal"></button>
        </div>
        <div class="modal-body p-4">
          <form @submit.prevent="guardarCompra">
            <div class="row g-3">
              <!-- Repuesto -->
              <div class="col-md-6">
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
              <div class="col-md-6">
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

              <!-- Cantidad y Precio -->
              <div class="col-md-6">
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

              <div class="col-md-6">
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

              <div class="col-12">
                <label class="form-label small fw-bold text-muted">
                  <i class="fas fa-calendar me-1"></i>Fecha Compra
                </label>
                <input v-model="nuevaCompra.fecha_compra" 
                       type="date" 
                       class="form-control border-success" 
                       required>
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
                  <button type="submit" class="btn btn-success fw-bold py-3">
                    <i class="fas fa-save me-2"></i>Registrar Compra
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
}
</style>