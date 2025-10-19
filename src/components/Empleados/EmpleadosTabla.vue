<template>
  <div class="card shadow-sm border-0 tabla-card-custom">
    <div class="card-header text-white"> 
      LiSTA DE EMPLEADOS REGISTRADOS
    </div>
    <div class="card-body p-0"> 
      <div class="table-responsive">
        <table class="table table-hover m-0 table-striped">
          <thead>
            <tr style="background-color: #7A8370;"> 
              <th style="color: orange;">Nombre</th>
              <th style="color: orange;">Cargo</th>
              <th style="color: orange;">Sueldo Base</th>
              <th style="color: orange;">Contrato</th>
              <th style="color: orange;">Estado</th>
              <th style="color: orange;">Fecha Ingreso</th>
              <th style="color: orange;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="empleado in listaEmpleados" :key="empleado.id">
              <td>{{ empleado.nombre }} {{ empleado.apellido }}</td>
              <td>{{ empleado.cargo }}</td>
              <td>${{ empleado.sueldoBase.toLocaleString('es-CL') }}</td>
              <td>{{ empleado.tipoContrato }}</td>
              <td>
                <span :class="{'badge bg-success': empleado.estado === 'Activo', 'badge bg-warning text-dark': empleado.estado !== 'Activo'}">
                    {{ empleado.estado }}
                </span>
              </td>
              <td>{{ empleado.fechaIngreso }}</td>
              <td>
                <button class="btn btn-sm btn-edit me-2" @click="$emit('editar-empleado', empleado.id)">
                  Editar
                </button>
                <button class="btn btn-sm btn-delete">Eliminar</button>
              </td>
            </tr>
            <tr v-if="listaEmpleados.length === 0">
                <td colspan="7" class="text-center text-muted">No hay empleados registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
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
/* Estilos para los botones */
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