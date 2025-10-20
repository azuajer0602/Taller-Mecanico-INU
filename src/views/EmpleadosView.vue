<script setup>
import { ref, onMounted, computed } from 'vue';
import EmpleadosTabla from '../components/Empleados/EmpleadosTabla.vue'; 
import EmpleadoFormulario from '../components/Empleados/EmpleadoFormulario.vue'; 

// Datos de la lógica
const empleados = ref([]);
const mostrarFormulario = ref(false);

//  la Variable reactiva para el texto de búsqueda (v-model)
const terminoBusqueda = ref('');

// datos simulados
const datosSimulados = [
  { id: 1, nombre: 'Javier', apellido: 'Pérez', cargo: 'Mecánico', sueldoBase: 850000, fechaIngreso: '2022-08-15', contacto: '987654321', tipoContrato: 'Indefinido', estado: 'Activo' },
  { id: 2, nombre: 'Ana', apellido: 'Gómez', cargo: 'Recepcionista', sueldoBase: 450000, fechaIngreso: '2023-01-20', contacto: '912345678', tipoContrato: 'Temporal', estado: 'Vacaciones' },
  { id: 3, nombre: 'Ricardo', apellido: 'Rojas', cargo: 'Jefe de Taller', sueldoBase: 1200000, fechaIngreso: '2021-05-10', contacto: '999887766', tipoContrato: 'Indefinido', estado: 'Activo' },
  { id: 4, nombre: 'Jose', apellido: 'Gonzalez', cargo: 'Ayudante de mecanico', sueldoBase: 300000, fechaIngreso: '2024-05-22', contacto: '9998574446', tipoContrato: 'Indefinido', estado: 'Activo' },
];

const cargarEmpleados = () => {
  empleados.value = [...datosSimulados]; // se uso spread para asegurar la reactividad
  mostrarFormulario.value = false;
};

const abrirEdicion = (empleadoId) => {
  console.log('Abrir edición para el ID:', empleadoId);
};

//La propiedad computada para filtrar la lista
const empleadosFiltrados = computed(() => {
    if (!terminoBusqueda.value) {
        return empleados.value;
    }

    const termino = terminoBusqueda.value.toLowerCase();

    return empleados.value.filter(empleado => {
        // Busca coincidencia en nombre, apellido o cargo
        return empleado.nombre.toLowerCase().includes(termino) ||
               empleado.apellido.toLowerCase().includes(termino) ||
               empleado.cargo.toLowerCase().includes(termino);
    });
});

onMounted(cargarEmpleados);
</script>

<template>
  <div class="empleados-view-container">
    <h1 class="mb-4 display-5">GESTIÓN DE EMPLEADOS</h1> 

    <div v-if="!mostrarFormulario">
        
        <div class="d-flex justify-content-between align-items-center mb-3">
            
            <button
                class="btn btn-primary btn-lg"
                @click="mostrarFormulario = true"
            >
                + Registrar Nuevo Empleado
            </button>

            <div class="input-group" style="width: 40%;">
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Buscar por Nombre, Apellido o Cargo..." 
                    v-model="terminoBusqueda" 
                />
                <span class="input-group-text">🔍</span>
            </div>
        </div>
        
      <EmpleadosTabla :lista-empleados="empleadosFiltrados" @editar-empleado="abrirEdicion"/>
    </div>

     <div v-else>
        <EmpleadoFormulario @empleado-registrado="cargarEmpleados" @cancelar="mostrarFormulario = false" class="mb-4" />
    </div>

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