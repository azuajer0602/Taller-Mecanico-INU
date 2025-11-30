<template>
  <div class="card shadow-sm border-0 form-card-custom">
    <div class="card-header text-white"> 
      {{ isEditing ? 'EDITAR EMPLEADO' : 'REGISTRAR NUEVO EMPLEADO' }}
    </div>
    <div class="card-body"> 
      <form @submit.prevent="handleSubmit">
        <div class="row g-3">
          
          <div class="col-md-6">
            <label for="usuario" class="form-label">Usuario:</label>
            <input type="text" class="form-control" id="usuario" v-model.trim="empleadoLocal.usuario" required />
          </div>
          <div class="col-md-6">
            <label for="contrasena" class="form-label">Contraseña: <small v-if="isEditing" class="text-muted"></small></label>
            <input type="password" class="form-control" id="contrasena" v-model="empleadoLocal.contrasena" :required="!isEditing" />
          </div>

          <div class="col-md-6">
            <label for="nombre_emp" class="form-label">Nombre:</label>
            <input type="text" class="form-control" id="nombre_emp" v-model.trim="empleadoLocal.nombre_emp" required />
          </div>
          <div class="col-md-6">
            <label for="apellido_emp" class="form-label">Apellido:</label>
            <input type="text" class="form-control" id="apellido_emp" v-model.trim="empleadoLocal.apellido_emp" required />
          </div>
          <div class="col-md-6">
            <label for="cedula_emp" class="form-label">Cédula:</label>
            <input type="text" class="form-control" id="cedula_emp" v-model.trim="empleadoLocal.cedula_emp" required />
          </div>

          <div class="col-md-6">
            <label for="cargo" class="form-label">Cargo:</label>
            <input type="text" class="form-control" id="cargo" v-model.trim="empleadoLocal.cargo" required />
          </div>
          <div class="col-md-6">
            <label for="sueldo_base" class="form-label">Sueldo Base ($):</label>
            <input type="number" step="0.01" class="form-control" id="sueldo_base" v-model.number="empleadoLocal.sueldo_base" required />
          </div>

          <div class="col-6">
            <label for="fecha_contratacion" class="form-label">Fecha Contratación:</label>
            <input type="date" class="form-control" id="fecha_contratacion" v-model="empleadoLocal.fecha_contratacion" required />
          </div>

        </div>

        <div class="d-flex justify-content-end mt-4">
          <button type="button" class="btn btn-secondary me-2" @click="handleCancel">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary btn-guardar">
            {{ isEditing ? 'Guardar Cambios' : 'Registrar Empleado' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const modeloEmpleadoBase = {
  id_empleado: null,
  usuario: '',
  contrasena: '',
  nombre_emp: '',
  apellido_emp: '',
  cedula_emp: '',
  cargo: '',
  sueldo_base: 0.00,
  fecha_contratacion: new Date().toISOString().substring(0, 10),
};

const props = defineProps({
  empleadoAEditar: {
    type: Object,
    default: null,
  },
});

const empleadoLocal = ref({ ...modeloEmpleadoBase });
const emit = defineEmits(['guardar-empleado', 'cancelar-edicion']);
const isEditing = computed(() => !!props.empleadoAEditar && !!props.empleadoAEditar.id_empleado);

watch(() => props.empleadoAEditar, (nuevoEmpleado) => {
  if (nuevoEmpleado && nuevoEmpleado.id_empleado) {
    empleadoLocal.value = { ...nuevoEmpleado, contrasena: '' };
  } else {
    empleadoLocal.value = { ...modeloEmpleadoBase };
  }
}, { immediate: true });

const handleSubmit = () => {
  emit('guardar-empleado', empleadoLocal.value);
};

const handleCancel = () => {
  empleadoLocal.value = { ...modeloEmpleadoBase };
  emit('cancelar-edicion'); 
};
</script>

<style scoped>
.form-card-custom {
    background-color: #D8D8C0; 
    border-radius: 8px;
   
    display: block !important; 
    width: 100% !important;
    z-index: 10;
}
.card-header {
    font-weight: 600;
    background-color: #7A8370 !important;
    font-size: 1.1rem;
    color: white !important;
}
.btn-guardar {
    background-color: #DF8615;
    border-color: #DF8615;
    color: white;
}
.btn-guardar:hover {
    background-color: #F84600;
    border-color: #F84600;
}
</style>