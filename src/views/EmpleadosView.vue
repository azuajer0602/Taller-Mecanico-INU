<template>
  <div class="empleados-view-container">
    <h1 class="mb-4">Gestión de Empleados</h1>
    
    <button 
      class="btn btn-primary mb-3" 
      @click="mostrarFormulario = true"
      v-if="!mostrarFormulario"
    >
      + Registrar Nuevo Empleado
    </button>
    
    <EmpleadoFormulario 
      v-if="mostrarFormulario"
      @empleado-registrado="cargarEmpleados"
      @cancelar="mostrarFormulario = false"
      class="mb-4 p-4 border rounded"
    />
    
    <EmpleadosTabla 
      :lista-empleados="empleados" 
      @editar-empleado="abrirEdicion"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import EmpleadosTabla from '@/components/Empleados/EmpleadosTabla.vue';
import EmpleadoFormulario from '@/components/Empleados/EmpleadoFormulario.vue';

// Datos de la lógica
const empleados = ref([]);
const mostrarFormulario = ref(false);

const datosSimulados = [
  { id: 1, nombre: 'Javier Pérez', cargo: 'Mecánico', especialidad: 'Motores', ingreso: '2022-08-15' },
  { id: 2, nombre: 'Ana Gómez', cargo: 'Recepcionista', especialidad: 'N/A', ingreso: '2023-01-20' },
  { id: 3, nombre: 'Ricardo Rojas', cargo: 'Administrador', especialidad: 'Finanzas', ingreso: '2021-05-10' },
];

const cargarEmpleados = () => {
  empleados.value = datosSimulados;
  mostrarFormulario.value = false;
};

const abrirEdicion = (empleadoId) => {
  console.log('Abrir edición para el ID:', empleadoId);
};

onMounted(cargarEmpleados);
</script>

<style scoped>
/* Estilos para el botón principal (NARANJA OSCURO) */
.btn-primary {
    background-color: #DF8615; /* naranja oscuro */
    border-color: #DF8615;
    transition: background-color 0.3s;
}
.btn-primary:hover {
    background-color: #F84600; /* rojo/naranja Fuerte */
    border-color: #F84600;
}
.empleados-view-container {
    background-color: #F0F0D8; /* marfil claro para el fondo de la vista */
    min-height: calc(100vh - 50px); /* ajusta la altura */
    padding: 20px;
    border-radius: 8px;
}
</style>