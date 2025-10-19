<template>
  <div class="card border-0 shadow-lg" style="background-color: #D8D8C0;">
    <div class="card-header bg-custom-primary text-white">
      Registrar Nuevo Empleado
    </div>
    <div class="card-body">
      <form @submit.prevent="guardarEmpleado">
        
        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre Completo</label>
          <input type="text" class="form-control" id="nombre" v-model="empleado.nombre" required>
        </div>
        
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="cargo" class="form-label">Cargo</label>
            <select class="form-select" id="cargo" v-model="empleado.cargo" required>
              <option value="">Seleccione un cargo</option>
              <option value="Mecánico">Mecánico</option>
              <option value="Recepcionista">Recepcionista</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label for="especialidad" class="form-label">Especialidad</label>
            <input type="text" class="form-control" id="especialidad" v-model="empleado.especialidad">
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

const empleado = ref({
  nombre: '',
  cargo: '',
  especialidad: '',
  ingreso: new Date().toISOString().split('T')[0],
});

const guardarEmpleado = () => {
  if (!empleado.value.nombre || !empleado.value.cargo) {
    alert('Por favor complete los campos obligatorios.');
    return;
  }
  
  console.log('Empleado a guardar:', empleado.value);
  alert(`Empleado ${empleado.value.nombre} registrado con éxito.`);
  
  emit('empleado-registrado');
};
</script>

<style scoped>
/* Estilos para el formulario */
.card-header {
  font-weight: 600;
}
.bg-custom-primary {
    background-color: #DF8615 !important; /* Naranja Oscuro */
}
.btn-success {
    background-color: #DF8615; /* Naranja Oscuro */
    border-color: #DF8615;
}
.btn-success:hover {
    background-color: #F84600;
    border-color: #F84600;
}
</style>