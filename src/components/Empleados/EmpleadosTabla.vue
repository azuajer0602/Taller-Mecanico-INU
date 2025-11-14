<template>
  <div class="card shadow-sm border-0 tabla-card-custom">
    <div class="card-header text-white"> 
      LISTA DE EMPLEADOS REGISTRADOS
    </div>
    <div class="card-body p-0"> 
      <div class="table-responsive">
        <table class="table table-hover m-0 table-striped">
          <thead>
            <tr style="background-color: #7A8370;"> 
              <th style="color: orange;">Usuario</th> 
              <th style="color: orange;">Nombre Completo</th>
              <th style="color: orange;">Cargo</th>
              <th style="color: orange;">Sueldo Base</th>
              <th style="color: orange;">Fecha Contratación</th>
              <th style="color: orange;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="empleado in listaEmpleados" :key="empleado.id_empleado">
              <td>{{ empleado.usuario }}</td>
              <td>{{ empleado.nombre_emp }} {{ empleado.apellido_emp }}</td>
              <td>{{ empleado.cargo }}</td>
              <td>${{ (empleado.sueldo_base * 1000).toLocaleString('es-CL') }}</td> 
              <td>{{ empleado.fecha_contratacion }}</td>
              <td>
                <button class="btn btn-sm btn-edit me-2" @click="$emit('editar-empleado', empleado)">
                  Editar
                </button>
                <button class="btn btn-sm btn-delete" @click="confirmarEliminar(empleado)">
                  Eliminar
                </button>
              </td>
            </tr>
            <tr v-if="listaEmpleados.length === 0">
              <td colspan="6" class="text-center text-muted">No hay empleados registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  listaEmpleados: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(['editar-empleado', 'eliminar-empleado']);

const confirmarEliminar = (empleado) => {
    const confirmacion = confirm(`¿Está seguro que desea eliminar al empleado ${empleado.nombre_emp} ${empleado.apellido_emp}?`);
    
    if (confirmacion) {
        emit('eliminar-empleado', empleado.id_empleado);
    }
};
</script>

<style scoped>
.tabla-card-custom {
    background-color: #F0F0D8;
    border-radius: 8px;
}
.card-header {
    font-weight: 600;
    background-color: #7A8370 !important;
    font-size: 1.1rem;
}
.table-hover tbody tr:hover {
    background-color: #D8D8C0 !important; 
}
.btn-edit {
    background-color: #DF8615; 
    border-color: #DF8615;
    color: white;
}
.btn-edit:hover {
    background-color: #F84600;
    border-color: #F84600;
}
.btn-delete {
    background-color: #F84600; 
    border-color: #F84600;
    color: white;
}
.btn-delete:hover {
    background-color: #c73800;
    border-color: #c73800;
}
</style>