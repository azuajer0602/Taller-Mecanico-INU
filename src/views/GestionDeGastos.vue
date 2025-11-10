<template>
  <div class="container mt-4">
    <div class="card shadow">
      <div class="card-header bg-dark text-white">
        <h1 class="mb-0 h3">
          <i class="bi bi-cash-coin me-2"></i>Módulo de Gestión de Gastos
        </h1>
      </div>

      <div class="card-body">
        <!-- FORMULARIO COLAPSABLE PARA AÑADIR GASTO -->
        <div class="accordion mb-4" id="accordionFormGasto">
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                <i class="bi bi-plus-circle-fill me-2"></i> Registrar Nuevo Gasto
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
                      <option v-for="cat in categoriasGasto" :key="cat" :value="cat">{{ cat }}</option>
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
                      <i class="bi bi-plus-lg me-2"></i>Agregar Gasto
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
            <i class="bi bi-info-circle-fill me-2"></i>No hay gastos registrados.
        </div>
        <div v-else class="list-group">
            <div v-for="(gasto, index) in gastos" :key="index" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">{{ gasto.descripcion }}</h6>
                        <small class="text-muted">{{ gasto.fecha }}</small>
                    </div>
                    <p class="mb-1">
                        <span class="badge bg-primary me-2">{{ gasto.categoria }}</span>
                        <span class="badge bg-secondary">{{ gasto.metodoPago }}</span>
                    </p>
                </div>
                <div class="ms-4 text-end">
                    <span class="fw-bold fs-5 d-block">${{ gasto.monto.toFixed(2) }}</span>
                    <button @click="eliminarGasto(index)" class="btn btn-outline-danger btn-sm mt-1" title="Eliminar Gasto">
                        <i class="bi bi-trash-fill"></i>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Collapse } from 'bootstrap';

const gastos = ref([]);
let accordionCollapse = null;

const nuevoGasto = ref({
  descripcion: '',
  monto: null,
  fecha: new Date().toISOString().split('T')[0],
  categoria: '',
  metodoPago: '',
});

const categoriasGasto = [
  'Repuestos y Materiales',
  'Salarios y Personal',
  'Alquiler y Servicios Públicos',
  'Herramientas y Equipamiento',
  'Marketing y Publicidad',
  'Gastos Administrativos',
  'Otros'
];

const metodosPago = [
  'Bs efectivo',
  'Divisas',
  'Punto de Venta',
  'Pago Móvil'
];

const agregarGasto = () => {
  if (nuevoGasto.value.descripcion && nuevoGasto.value.monto > 0 && nuevoGasto.value.fecha && nuevoGasto.value.categoria && nuevoGasto.value.metodoPago) {
    gastos.value.unshift({ ...nuevoGasto.value }); // Agrega al inicio para ver el último gasto primero
    // Resetear formulario
    nuevoGasto.value.descripcion = '';
    nuevoGasto.value.monto = null;
    nuevoGasto.value.fecha = new Date().toISOString().split('T')[0];
    nuevoGasto.value.categoria = '';
    nuevoGasto.value.metodoPago = '';
    // Ocultar el acordeón después de agregar
    accordionCollapse?.hide();
  } else {
    alert('Por favor, complete todos los campos del gasto.');
  }
};

const eliminarGasto = (index) => {
  gastos.value.splice(index, 1);
};

const totalGastos = computed(() => {
  return gastos.value.reduce((total, gasto) => total + gasto.monto, 0);
});

onMounted(() => {
  const collapseElement = document.getElementById('collapseOne');
  if (collapseElement) {
    accordionCollapse = new Collapse(collapseElement, { toggle: false });
  }
});
</script>