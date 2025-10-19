<script setup>
import { ref, onMounted } from 'vue';
import EmpleadosTabla from '../components/Empleados/EmpleadosTabla.vue'; // Ruta Corregida
import EmpleadoFormulario from '../components/Empleados/EmpleadoFormulario.vue'; // Ruta Corregida

// Datos de la lógica
const empleados = ref([]);
const mostrarFormulario = ref(false);

//datos simulados
const datosSimulados = [
  {
    id: 1,
    nombre: 'Javier',
    apellido: 'Pérez',
    cargo: 'Mecánico',
    sueldoBase: 850000,
    fechaIngreso: '2022-08-15',
    contacto: '987654321',
    tipoContrato: 'Indefinido',
    estado: 'Activo'
  },

  {
    id: 2,
    nombre: 'Ana',
    apellido: 'Gómez',
    cargo: 'Recepcionista',
    sueldoBase: 450000,
    fechaIngreso: '2023-01-20',
    contacto: '912345678',
    tipoContrato: 'Temporal',
    estado: 'Vacaciones'
  },

  {
    id: 3,
    nombre: 'Ricardo',
    apellido: 'Rojas',
    cargo: 'Jefe de Taller',
    sueldoBase: 1200000,
    fechaIngreso: '2021-05-10',
    contacto: '999887766',
    tipoContrato: 'Indefinido',
    estado: 'Activo'
  },
  {
    id: 4,
    nombre: 'Jose',
    apellido: 'Gonzalez',
    cargo: 'Ayudante de mecanico',
    sueldoBase: 300000,
    fechaIngreso: '2024-05-22',
    contacto: '9998574446',
    tipoContrato: 'Indefinido',
    estado: 'Activo'
  },
];

const cargarEmpleados = () => {
  empleados.value = datosSimulados;
  mostrarFormulario.value = false;
};

const abrirEdicion = (empleadoId) => {
  console.log('Abrir edición para el ID:', empleadoId);
  // Aquí iría la lógica para cargar el formulario con los datos del empleado.

};

onMounted(cargarEmpleados);
</script>

<template>
  <div class="empleados-view-container">
    <h1 class="mb-4 display-5">GESTIÓN DE EMPLEADOS</h1> <button
      class="btn btn-primary btn-lg mb-3"
      @click="mostrarFormulario = true"
      v-if="!mostrarFormulario"
    >
      + Registrar Nuevo Empleado
    </button>

    <EmpleadoFormulario
      v-if="mostrarFormulario"
      @empleado-registrado="cargarEmpleados"
      @cancelar="mostrarFormulario = false"
      class="mb-4"
    />

    <EmpleadosTabla
    v-if="!mostrarFormulario"
      :lista-empleados="empleados"
      @editar-empleado="abrirEdicion"
    />
  </div>
</template>



<style scoped>
h1 {
    text-align: center;
    text-shadow: 2px 2px 4px rgb(101, 51, 16); 
}  
.btn-primary {
    background-color: #DF8615;
    border-color: #DF8615;
    transition: background-color 0.3s;
}

.btn-primary:hover {
    background-color: #F84600;
    border-color: #F84600;
}

.empleados-view-container {
    background-color: #F0F0D8; /* Marfil Claro para el fondo de la vista */
    min-height: calc(100vh - 50px);
    padding: 20px;
    border-radius: 8px;
}
</style>