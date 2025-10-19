<template>
  <div class="card border-0 shadow-lg form-card-custom">
    <div class="card-header bg-custom-primary text-white">
      Registrar Nuevo Empleado
    </div>

    <div class="card-body">
      <form @submit.prevent="guardarEmpleado">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="nombre" class="form-label">Nombre</label>
            <input type="text" class="form-control" id="nombre" v-model="empleado.nombre" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="apellido" class="form-label">Apellido</label>
            <input type="text" class="form-control" id="apellido" v-model="empleado.apellido" required>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="cargo" class="form-label">Cargo</label>
            <input type="text" class="form-control" id="cargo" v-model="empleado.cargo" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="sueldoBase" class="form-label">Sueldo Base ($)</label>
            <input type="number" class="form-control" id="sueldoBase" v-model.number="empleado.sueldoBase" required>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="fechaIngreso" class="form-label">Fecha de Ingreso</label>
            <input type="date" class="form-control" id="fechaIngreso" v-model="empleado.fechaIngreso" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="contacto" class="form-label">Contacto (Teléfono)</label>
            <input type="tel" class="form-control" id="contacto" v-model="empleado.contacto">
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="tipoContrato" class="form-label">Tipo de Contrato</label>
            <select class="form-select" id="tipoContrato" v-model="empleado.tipoContrato" required>
              <option value="">Seleccione contrato</option>
              <option value="Indefinido">Indefinido</option>
              <option value="Temporal">Temporal</option>
              <option value="Por Proyecto">Por Proyecto</option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label for="estado" class="form-label">Estado</label>
            <select class="form-select" id="estado" v-model="empleado.estado" required>
              <option value="Activo">Activo</option>
              <option value="Vacaciones">Vacaciones</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
        <div class="d-flex justify-content-end mt-4">
          <button type="button" class="btn btn-secondary me-2" @click="$emit('cancelar')">
            Cancelar
          </button>
          <button type="submit" class="btn btn-success">
            Guardar Empleado
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['empleado-registrado', 'cancelar']);

// Los valores iniciales reflejan los campos
const empleado = ref({
  nombre: '',
  apellido: '',
  cargo: '',
  sueldoBase: 0,
  fechaIngreso: new Date().toISOString().split('T')[0],
  contacto: '',
  tipoContrato: '',
  estado: 'Activo',
});

const guardarEmpleado = () => {
  if (!empleado.value.nombre || !empleado.value.cargo) {
    alert('Por favor complete los campos obligatorios.');
    return;
  }

  console.log('Empleado a guardar:', empleado.value);
  alert(`Empleado ${empleado.value.nombre} registrado con éxito.`);

  // Limpia el formulario y emite el evento
  empleado.value = {
    nombre: '',
    apellido: '',
    cargo: '',
    sueldoBase: 0,
    fechaIngreso: new Date().toISOString().split('T')[0],
    contacto: '',
    tipoContrato: '',
    estado: 'Activo',
  };
  emit('empleado-registrado');
};
</script>

<style scoped>
/* Estilos para el formulario y botones */
.form-card-custom {
    background-color: #D8D8C0; /* Gris Claro */
}

.card-header {
  font-weight: 600;
  background-color: #DF8615 !important; 
  font-size: 1.25rem;
}
.form-label {
    font-weight: 500;
}

.btn-success {
    background-color: #DF8615;
    border-color: #DF8615;
}

.btn-success:hover {
    background-color: #F84600;
    border-color: #F84600;
}
</style>