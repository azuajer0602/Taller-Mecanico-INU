<template>
  <div class="card shadow-sm border-0">
    <div class="card-header text-white"> 
      Lista de Empleados Registrados
    </div>
    <div class="card-body p-0" style="background-color: #D8D8C0;"> 
      <table class="table table-hover m-0" style="background-color: #D8D8C0;">
        <thead>
          <tr style="background-color: #7A8370;"> 
            <th style="color: white;">Nombre</th>
            <th style="color: white;">Cargo</th>
            <th style="color: white;">Especialidad</th>
            <th style="color: white;">Fecha de Ingreso</th>
            <th style="color: white;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empleado in listaEmpleados" :key="empleado.id">
            <td>{{ empleado.nombre }}</td>
            <td>{{ empleado.cargo }}</td>
            <td>{{ empleado.especialidad }}</td>
            <td>{{ empleado.ingreso }}</td>
            <td>
              <button 
                class="btn btn-sm btn-edit me-2" 
                @click="$emit('editar-empleado', empleado.id)"
              >
                Editar
              </button>
              <button class="btn btn-sm btn-delete">Eliminar</button>
            </td>
          </tr>
          <tr v-if="listaEmpleados.length === 0">
              <td colspan="5" class="text-center text-muted">No hay empleados registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  listaEmpleados: {
    type: Array,
    required: true,
  },
});
defineEmits(['editar-empleado']);
</script>

<style scoped>
/* Requisito 6: Estilos basados en la paleta */

.card-header {
  font-weight: 600;
  background-color: #7A8370 !important; /* Gris Oliva */
}
.table-hover tbody tr:hover {
    background-color: #D8D8C0 !important; /* Gris Claro al hacer hover */
}
/* Estilos personalizados para los botones de la tabla */
.btn-edit {
    background-color: #DF8615; /* Naranja Oscuro */
    border-color: #DF8615;
    color: white;
}
.btn-edit:hover {
    background-color: #F84600;
    border-color: #F84600;
}
.btn-delete {
    background-color: #F84600; /* Rojo/Naranja Fuerte */
    border-color: #F84600;
    color: white;
}
.btn-delete:hover {
    background-color: #c73800;
    border-color: #c73800;
}
</style>