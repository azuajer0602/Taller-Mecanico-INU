<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, computed, onMounted } from 'vue';
import { Collapse } from 'bootstrap';
import api from '../backend/services/api.js';

// Estado reactivo
const gastos = ref([]);
const categoriasGasto = ref([]);
let accordionCollapse = null;

const nuevoGasto = ref({
  descripcion: '',
  monto: null,
  fecha: new Date().toISOString().split('T')[0],
  categoria: '',
  metodoPago: '',
});

const metodosPago = [
  'Bolivares',
  'Divisas',
  'Punto de Venta',
  'Pago Móvil'
];

// Computed properties
const totalGastos = computed(() => {
  return gastos.value.reduce((total, gasto) => total + parseFloat(gasto.monto_gasto || 0), 0);
});

// Métodos
const agregarGasto = async () => {
  if (nuevoGasto.value.descripcion && nuevoGasto.value.monto > 0 && nuevoGasto.value.fecha && nuevoGasto.value.categoria && nuevoGasto.value.metodoPago) {
    try {
      const gastoData = {
        fecha_gasto: nuevoGasto.value.fecha,
        monto_gasto: nuevoGasto.value.monto,
        descp_gasto: nuevoGasto.value.descripcion,
        tipo_gasto: nuevoGasto.value.categoria,
        id_cate_gasto: categoriasGasto.value.find(cat => cat.nombre_cate === nuevoGasto.value.categoria)?.id_cate_gasto,
        metodo_pago: nuevoGasto.value.metodoPago
      };

      await api.post('/gastos', gastoData);
      await cargarGastos(); // Recargar la lista

      // Resetear formulario
      nuevoGasto.value.descripcion = '';
      nuevoGasto.value.monto = null;
      nuevoGasto.value.fecha = new Date().toISOString().split('T')[0];
      nuevoGasto.value.categoria = '';
      nuevoGasto.value.metodoPago = '';
      // Ocultar el acordeón después de agregar
      accordionCollapse?.hide();
    } catch (error) {
      console.error('Error agregando gasto:', error);
      alert('Error al agregar el gasto. Intente nuevamente.');
    }
  } else {
    alert('Por favor, complete todos los campos del gasto.');
  }
};

const eliminarGasto = async (index) => {
  const gasto = gastos.value[index];
  if (confirm('¿Está seguro de que desea eliminar este gasto?')) {
    try {
      await api.delete(`/gastos/${gasto.id_gasto}`);
      await cargarGastos(); // Recargar la lista para reflejar la eliminación
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      alert('Error al eliminar el gasto.');
    }
  }
};

const cargarGastos = async () => {
  try {
    const response = await api.get('/gastos');
    gastos.value = response.data;
  } catch (error) {
    console.error('Error cargando gastos:', error);
  }
};

const cargarCategorias = async () => {
  try {
    const response = await api.get('/categorias-gasto');
    categoriasGasto.value = response.data;
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
};

// Inicialización
onMounted(async () => {
  const collapseElement = document.getElementById('collapseOne');
  if (collapseElement) {
    accordionCollapse = new Collapse(collapseElement, { toggle: false });
  }

  await cargarCategorias();
  await cargarGastos();
});
</script>

<template>
  <Side/>
  <div class="main-content">
    <div class="container mt-4">
      <div class="card shadow">
        <div class="card-header bg-dark text-white">
          <h1 class="mb-0 h3">
            <i class="fas fa-cash-register me-2"></i>Módulo de Gestión de Gastos
          </h1>
        </div>

        <div class="card-body">
          <!-- FORMULARIO COLAPSABLE PARA AÑADIR GASTO -->
          <div class="accordion mb-4" id="accordionFormGasto">
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingOne">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                  <i class="fas fa-plus-circle me-2"></i> Registrar Nuevo Gasto
                </button>
              </h2>
              <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionFormGasto">
                <div class="accordion-body">
                  <form @submit.prevent="agregarGasto" class="row g-3">
                    <div class="col-md-6 col-lg-4">
                      <label for="descripcion" class="form-label">Descripción:</label>
                      <input id="descripcion" v-model="nuevoGasto.descripcion" type="text" class="form-control" required />
                    </div>
                    <div class="col-md-6 col-lg-2">
                      <label for="monto" class="form-label">Monto ($):</label>
                      <input id="monto" v-model.number="nuevoGasto.monto" type="number" step="0.01" min="0" class="form-control" required />
                    </div>
                    <div class="col-md-6 col-lg-2">
                      <label for="fecha" class="form-label">Fecha:</label>
                      <input id="fecha" v-model="nuevoGasto.fecha" type="date" class="form-control" required />
                    </div>
                    <div class="col-md-6 col-lg-2">
                      <label for="categoria" class="form-label">Categoría:</label>
                      <select id="categoria" v-model="nuevoGasto.categoria" class="form-select" required>
                        <option disabled value="">Seleccione...</option>
                        <option v-for="cat in categoriasGasto" :key="cat.id_cate_gasto" :value="cat.nombre_cate">{{ cat.nombre_cate }}</option>
                      </select>
                    </div>
                    <div class="col-md-6 col-lg-2">
                      <label for="metodoPago" class="form-label">Método de Pago:</label>
                      <select id="metodoPago" v-model="nuevoGasto.metodoPago" class="form-select" required>
                        <option disabled value="">Seleccione...</option>
                        <option v-for="metodo in metodosPago" :key="metodo" :value="metodo">{{ metodo }}</option>
                      </select>
                    </div>
                    <div class="col-12">
                      <button type="submit" class="btn btn-success" title="Agregar Gasto">
                        <i class="fas fa-plus me-2"></i>Agregar Gasto
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- LISTA DE GASTOS -->
          <h3 class="h5 mb-3 border-bottom pb-2">Listado de Gastos</h3>
          <div v-if="gastos.length === 0" class="alert alert-info">
              <i class="fas fa-info-circle me-2"></i>No hay gastos registrados.
          </div>
          <div v-else class="list-group">
              <div v-for="(gasto, index) in gastos" :key="index" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div class="flex-grow-1">
                      <div class="d-flex w-100 justify-content-between">
                          <h6 class="mb-1">{{ gasto.descp_gasto }}</h6>
                          <small class="text-muted">{{ new Date(gasto.fecha_gasto).toLocaleDateString('es-ES') }}</small>
                      </div>
                      <p class="mb-1">
                          <span class="badge bg-primary me-2">{{ gasto.nombre_cate || gasto.tipo_gasto }}</span>
                          <span class="badge bg-secondary">{{ gasto.metodo_pago }}</span>
                      </p>
                  </div>
                  <div class="ms-4 text-end">
                      <span class="fw-bold fs-5 d-block">${{ parseFloat(gasto.monto_gasto).toFixed(2) }}</span>
                      <button @click="eliminarGasto(index)" class="btn btn-outline-danger btn-sm mt-1" title="Eliminar Gasto">
                          <i class="fas fa-trash"></i>
                      </button>
                  </div>
              </div>
          </div>

          <!-- TOTAL DE GASTOS -->
          <div class="alert alert-primary mt-4 text-end" role="alert">
              <h4 class="alert-heading mb-0">Total Gastado: <span class="fw-bold">{{ totalGastos.toFixed(2) }} $</span></h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  padding: 20px;
  min-height: 100vh;
  margin-left: 250px;
  background: linear-gradient(#ff7e5f, #feb47b);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.card {
  background-color: #D8D8C0;
  border-radius: 16px;
  border: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 1200px;
}

.card-header {
  border-radius: 16px 16px 0 0 !important;
  background-color: #2c3e50 !important;
}

.form-label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 14px;
}

.form-control, .form-select {
  border: 2px solid #7A8370;
  border-radius: 8px;
  padding: 10px 15px;
  transition: all 0.3s ease;
  background-color: #f7f7f0;
  color: #2c3e50;
}

.form-control:focus, .form-select:focus {
  border-color: #DF8615;
  box-shadow: 0 0 0 0.25rem rgba(223, 134, 21, 0.25);
}

.btn-success {
  background-color: #28a745;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.btn-success:hover {
  background-color: #218838;
}

.accordion-button {
  background-color: #1ca8e9;
  color: white;
  font-weight: bold;
}

.accordion-button:not(.collapsed) {
  background-color: #23c0f0;
  color: white;
}

.list-group-item {
  background-color: #f7f7f0;
  border: 1px solid #7A8370;
  margin-bottom: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.list-group-item:hover {
  background-color: #e9e9e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.badge {
  font-size: 0.8em;
  padding: 6px 12px;
  border-radius: 12px;
}

.alert {
  border-radius: 8px;
  border: none;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.alert-primary {
  background-color: #cce7ff;
  color: #004085;
  border-left: 4px solid #007bff;
}

@media (max-width: 992px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
    align-items: flex-start;
  }
  
  .card {
    margin: 0;
  }
}

.logo-fixed {
  display: none;
}
</style>