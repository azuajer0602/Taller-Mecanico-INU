<template>
  <div class="container mt-4">
    <div class="card shadow">
      <div class="card-header bg-secondary text-white">
        <h1 class="mb-0 h3">
          <i class="bi bi-clock-history me-2"></i>Historial de Facturas
        </h1>
      </div>

      <div class="card-body">
        <!-- Barra de Búsqueda -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-calendar-date"></i></span>
              <input type="date" class="form-control" v-model="fechaBusqueda" @change="buscarFacturasPorFecha">
              <button class="btn btn-outline-secondary" @click="limpiarBusqueda">Limpiar</button>
            </div>
          </div>
        </div>

        <!-- Tabla de Facturas -->
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        <div v-else-if="facturas.length === 0" class="alert alert-info">
          No se encontraron facturas para los criterios seleccionados.
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
              <tr v-for="factura in facturas" :key="factura.id">
                <td>{{ factura.id }}</td>
                <td>{{ factura.Cliente.nombre }} {{ factura.Cliente.apellido }}</td>
                <td>{{ factura.fechaPago }}</td>
                <td>${{ parseFloat(factura.total).toFixed(2) }}</td>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/facturas';

const facturas = ref([]);
const loading = ref(true);
const fechaBusqueda = ref('');

const fetchFacturas = async (params = {}) => {
  loading.value = true;
  try {
    const response = await axios.get(API_URL, { params });
    facturas.value = response.data;
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    alert("No se pudieron cargar las facturas.");
  } finally {
    loading.value = false;
  }
};

const buscarFacturasPorFecha = () => {
  if (fechaBusqueda.value) {
    fetchFacturas({ fecha: fechaBusqueda.value });
  }
};

const limpiarBusqueda = () => {
  fechaBusqueda.value = '';
  fetchFacturas();
};

const anularFactura = async (id) => {
  if (confirm('¿Está seguro de que desea ANULAR esta factura? Esta acción no se puede deshacer.')) {
    try {
      await axios.patch(`${API_URL}/${id}/anular`);
      alert('Factura anulada correctamente.');
      fetchFacturas(); 
    } catch (error) {
      console.error("Error al anular factura:", error);
      alert('No se pudo anular la factura.');
    }
  }
};

const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axios.patch(`${API_URL}/${id}/estado`, { estado: nuevoEstado });
      alert(`Estado de la factura cambiado a ${nuevoEstado}.`);
      fetchFacturas(); 
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert('No se pudo cambiar el estado.');
    }
};

const verDetalles = (factura) => {
  const detallesItems = factura.ItemFacturas.map(item => 
    `- ${item.descripcion} (Cant: ${item.cantidad}, Precio: $${parseFloat(item.precio).toFixed(2)})`
  ).join('\n');

  alert(
    `Detalles de la Factura #${factura.id}\n\n` +
    `Cliente: ${factura.Cliente.nombre} ${factura.Cliente.apellido}\n` +
    `Cédula: ${factura.Cliente.cedula}\n` +
    `Total: $${parseFloat(factura.total).toFixed(2)}\n\n` +
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
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}
.btn-group .btn {
  margin-right: 5px;
}
</style>