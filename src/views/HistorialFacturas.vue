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
            <td>{{ factura.fechaPago }}</td>
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
                  class="btn btn-sm btn-outline-success" 
                  @click="cambiarEstado(factura.id, 'Pagado')" 
                  v-if="factura.estado === 'Pendiente'"
                  title="Marcar como Pagada">
                  <i class="bi bi-check-circle-fill"></i>
                </button>
                <button 
                  class="btn btn-sm btn-outline-danger" 
                  @click="anularFactura(factura.id)" 
                  v-if="factura.estado !== 'Anulada'"
                  title="Anular Factura">
                  <i class="bi bi-x-circle-fill"></i>
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

const fetchFacturas = () => {
  loading.value = true;
  try {
    // Leemos las facturas desde localStorage
    const facturasGuardadas = JSON.parse(localStorage.getItem('facturas') || '[]');
    // Ordenamos para mostrar las más nuevas primero
    facturas.value = facturasGuardadas.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error("Error al cargar facturas desde localStorage:", error);
    // Este mensaje solo aparecería si hay un problema con localStorage, lo cual es raro.
    alert("No se pudieron cargar las facturas del historial local.");
  } finally {
    loading.value = false;
  }
};

const facturasFiltradas = computed(() => {
  // Si no hay facturas, no hay nada que filtrar
  if (!facturas.value) return [];

  return facturas.value.filter(factura => {
    const filtroFecha = !filtros.value.fecha || factura.fechaPago === filtros.value.fecha;
    const nombreCompleto = `${factura.Cliente.nombre} ${factura.Cliente.apellido}`.toLowerCase();
    const filtroNombre = !filtros.value.nombre || nombreCompleto.includes(filtros.value.nombre.toLowerCase());
    return filtroFecha && filtroNombre;
  });
});

const limpiarFiltros = () => {
  filtros.value.fecha = '';
  filtros.value.nombre = '';
};

const actualizarStorage = () => {
  localStorage.setItem('facturas', JSON.stringify(facturas.value));
  fetchFacturas(); // Recargamos y reordenamos la lista
};

const anularFactura = (id) => {
  if (confirm('¿Está seguro de que desea ANULAR esta factura? Esta acción no se puede deshacer.')) {
    const index = facturas.value.findIndex(f => f.id === id);
    if (index !== -1) {
      facturas.value[index].estado = 'Anulada';
      actualizarStorage();
      alert('Factura anulada correctamente.');
    } else {
      alert('Error: No se encontró la factura.');
    }
  }
};

const cambiarEstado = (id, nuevoEstado) => {
  const index = facturas.value.findIndex(f => f.id === id);
  if (index !== -1) {
    facturas.value[index].estado = nuevoEstado;
    actualizarStorage();
    alert(`Estado de la factura cambiado a ${nuevoEstado}.`);
  } else {
    alert('Error: No se encontró la factura.');
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
  fetchFacturas();
});

// Exponemos el método para que el componente padre pueda llamarlo
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