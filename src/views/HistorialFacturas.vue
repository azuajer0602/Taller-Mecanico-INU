<template>
  <div>
    <!-- Barra de Búsqueda -->
    <div class="row mb-4">
      <div class="col-md-6 mb-3 mb-md-0">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-calendar-date"></i></span>
          <input type="date" class="form-control" v-model="filtros.fecha">
        </div>
      </div>
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-person"></i></span>
          <input type="text" class="form-control" placeholder="Buscar por nombre de cliente..." v-model="filtros.nombre">
          <button class="btn btn-outline-secondary" @click="limpiarFiltros" title="Limpiar filtros">
            <i class="bi bi-x-lg"></i> Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de Facturas -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="facturasFiltradas.length === 0" class="alert alert-info">
      No se encontraron facturas. Puede generar una nueva o limpiar los filtros.
    </div>
    <div v-else class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th># Factura</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="factura in facturasFiltradas" :key="factura.id">
            <td>{{ factura.id }}</td>
            <td>{{ factura.Cliente.nombre }} {{ factura.Cliente.apellido }}</td>
            <td>{{ new Date(factura.fechaPago).toLocaleDateString() }}</td>
            <td>{{ getMoneda(factura) }}{{ parseFloat(factura.total).toFixed(2) }}</td>
            <td>
              <span class="badge" :class="getEstadoClass(factura.estado)">
                {{ factura.estado }}
              </span>
            </td>
            <td class="text-center">
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary" @click="verDetalles(factura)" title="Ver Detalles">
                  <i class="bi bi-eye-fill"></i>
                </button>
                <button
                  v-if="factura.estado === 'Pagado'"
                  class="btn btn-sm btn-outline-warning"
                  @click="cambiarEstado(factura.id, 'Pendiente')"
                  title="Cambiar a Pendiente">
                  <i class="bi bi-clock-history"></i>
                </button>
                <button
                  v-if="factura.estado === 'Pendiente'"
                  class="btn btn-sm btn-outline-success"
                  @click="cambiarEstado(factura.id, 'Pagado')"
                  title="Marcar como Pagado">
                  <i class="bi bi-check-circle"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="anularFactura(factura.id)"
                  title="Anular Factura">
                  <i class="bi bi-x-circle"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineExpose } from 'vue';

const facturas = ref([]);
const loading = ref(true);
const filtros = ref({
  fecha: '',
  nombre: ''
});

const API_BASE = 'http://localhost:3000/api';

const fetchFacturas = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${API_BASE}/facturas`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    if (data.success) {
      facturas.value = data.data ? data.data.sort((a, b) => b.id - a.id) : [];
    } else {
      throw new Error(data.message || 'La API devolvió un error');
    }
  } catch (error) {
    console.error("Error al cargar facturas desde el backend:", error);
    facturas.value = []; // Asegurar que facturas esté vacío en caso de error
    alert("No se pudieron cargar las facturas. Revise la conexión con el servidor.");
  } finally {
    loading.value = false;
  }
};

const facturasFiltradas = computed(() => {
  if (!facturas.value) return [];

  return facturas.value.filter(factura => {
    const fechaFactura = new Date(factura.fechaPago).toISOString().split('T')[0];
    const filtroFecha = !filtros.value.fecha || fechaFactura === filtros.value.fecha;
    const nombreCompleto = `${factura.Cliente?.nombre || ''} ${factura.Cliente?.apellido || ''}`.toLowerCase();
    const filtroNombre = !filtros.value.nombre || nombreCompleto.includes(filtros.value.nombre.toLowerCase());
    return filtroFecha && filtroNombre;
  });
});

const limpiarFiltros = () => {
  filtros.value.fecha = '';
  filtros.value.nombre = '';
};

const anularFactura = async (id) => {
  if (confirm('¿Está seguro de que desea ANULAR esta factura? Esta acción no se puede deshacer.')) {
    try {
      const response = await fetch(`${API_BASE}/facturas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Anulada' })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Error en la respuesta de la API');
      }
      await fetchFacturas();
      alert('Factura anulada correctamente.');
    } catch (error) {
      console.error("Error al anular la factura:", error);
      alert('Error: No se pudo anular la factura.');
    }
  }
};

const cambiarEstado = async (id, nuevoEstado) => {
  try {
    const response = await fetch(`${API_BASE}/facturas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error en la respuesta de la API');
    }
    await fetchFacturas();
    alert(`Estado de la factura cambiado a ${nuevoEstado}.`);
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    alert('Error: No se pudo cambiar el estado de la factura.');
  }
};

const getMoneda = (factura) => factura.metodoPago === 'Divisas' ? '$' : 'Bs';

const verDetalles = (factura) => {
  const monedaSimbolo = getMoneda(factura);
  const detallesItems = factura.ItemFacturas.map(item => 
    `- ${item.descripcion} (Cant: ${item.cantidad}, Precio: ${monedaSimbolo}${parseFloat(item.precio).toFixed(2)})`
  ).join('\n');

  alert(
    `Detalles de la Factura #${factura.id}\n\n` +
    `Cliente: ${factura.Cliente.nombre} ${factura.Cliente.apellido}\n` +
    `Cédula: ${factura.Cliente.cedula}\n` +
    `Total: ${monedaSimbolo}${parseFloat(factura.total).toFixed(2)}\n\n` +
    `Productos/Servicios:\n${detallesItems}`
  );
};

const getEstadoClass = (estado) => {
  switch (estado) {
    case 'Pagado': return 'bg-success';
    case 'Pendiente': return 'bg-warning text-dark';
    case 'Anulada': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

onMounted(() => {
  // fetchFacturas(); // Ya no se llama aquí, se llama desde el padre
});

defineExpose({ fetchFacturas });
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}
.btn-group .btn {
  margin-right: 5px;
}
.btn-group .btn:last-child {
  margin-right: 0;
}
</style>
