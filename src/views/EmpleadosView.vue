<script setup>
import { ref, onMounted, computed } from 'vue';
import EmpleadosTabla from '../components/Empleados/EmpleadosTabla.vue'; 
import EmpleadoFormulario from '../components/Empleados/EmpleadoFormulario.vue'; 

// estado central del sistema
const empleados = ref([]);
const mostrarFormulario = ref(false); 
const terminoBusqueda = ref('');
const empleadoSeleccionado = ref(null); 

const estaEnModoFormulario = computed(() => {
    return mostrarFormulario.value || empleadoSeleccionado.value !== null;
});

// datos simulados (Api)
const datosSimulados = [
    { 
        id_empleado: 1, 
        usuario: 'jperez', 
        contrasena: 'hashed123', 
        nombre_emp: 'Javier', 
        apellido_emp: 'Pérez', 
        cargo: 'Mecánico Senior', 
        sueldo_base: 850.00, 
        fecha_contratacion: '2022-08-15'
    },
    { 
        id_empleado: 2, 
        usuario: 'agomez', 
        contrasena: 'hashed456', 
        nombre_emp: 'Ana', 
        apellido_emp: 'Gómez', 
        cargo: 'Recepcionista', 
        sueldo_base: 450.00, 
        fecha_contratacion: '2023-01-20'
    },
    { 
        id_empleado: 3, 
        usuario: 'rrojas', 
        contrasena: 'hashed789', 
        nombre_emp: 'Ricardo', 
        apellido_emp: 'Rojas', 
        cargo: 'Jefe de Taller', 
        sueldo_base: 1200.00, 
        fecha_contratacion: '2021-05-10'
    },
];

const cargarEmpleados = () => {
    empleados.value = datosSimulados.map(e => ({ ...e }));
};

// ahora la logica de eventos crud

const handleGuardarEmpleado = (empleado) => {
    if (empleado.id_empleado) {
        // Lógica de edición
        const index = empleados.value.findIndex(e => e.id_empleado === empleado.id_empleado);
        if (index !== -1) {
            empleados.value[index] = { 
                ...empleados.value[index],
                ...empleado, 
                contrasena: empleado.contrasena || empleados.value[index].contrasena 
            };
            alert(`Empleado ${empleado.nombre_emp} actualizado con éxito.`);
        }
    } else {
        // Lógica de registro
        const newId = Math.max(...empleados.value.map(e => e.id_empleado), 0) + 1;
        const nuevoEmpleado = { ...empleado, id_empleado: newId };
        empleados.value.push(nuevoEmpleado);
        alert(`Empleado ${empleado.nombre_emp} registrado con ID ${newId}.`);
    }

    // Limpia el estado y oculta el formulario
    mostrarFormulario.value = false;
    empleadoSeleccionado.value = null;
};

const handleEditarEmpleado = (empleado) => {
    empleadoSeleccionado.value = empleado;
    mostrarFormulario.value = true;
};

const handleEliminarEmpleado = (id) => {
    const confirmacion = confirm("¿Está seguro de eliminar este empleado?");
    if (confirmacion) {
        empleados.value = empleados.value.filter(e => e.id_empleado !== id);
        alert(`Empleado con ID ${id} eliminado.`);
    }
};

const handleCancelar = () => {
    mostrarFormulario.value = false;
    empleadoSeleccionado.value = null;
};

// logica de filtrado en busqueda
const empleadosFiltrados = computed(() => {
    if (!terminoBusqueda.value) {
        return empleados.value;
    }
    const termino = terminoBusqueda.value.toLowerCase();
    return empleados.value.filter(empleado => {
        return empleado.nombre_emp.toLowerCase().includes(termino) ||
               empleado.apellido_emp.toLowerCase().includes(termino) ||
               empleado.cargo.toLowerCase().includes(termino);
    });
});

onMounted(cargarEmpleados);
</script>

<template>
  <div class="container my-5 empleados-view-container">
    <h1 class="mb-4 display-5 text-center">GESTIÓN DE EMPLEADOS</h1> 

    <div class="formulario-container mb-4" v-show="estaEnModoFormulario">
        <EmpleadoFormulario 
            :empleado-a-editar="empleadoSeleccionado"
            @guardar-empleado="handleGuardarEmpleado" 
            @cancelar-edicion="handleCancelar"
        />
    </div>

    <div>
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            
            <button
                v-if="!estaEnModoFormulario"
                class="btn btn-primary btn-lg"
                @click="mostrarFormulario = true; empleadoSeleccionado = null"
                title="Mostrar formulario para registrar un nuevo empleado"
            >
                + Registrar Nuevo Empleado
            </button>
            
            <div v-else class="py-2"></div> 

            <div class="input-group mt-2 mt-md-0" style="max-width: 400px;">
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Buscar por Nombre, Apellido o Cargo..." 
                    v-model="terminoBusqueda" 
                />
                <span class="input-group-text">🔍</span>
            </div>
        </div>
        
        <EmpleadosTabla 
            :lista-empleados="empleadosFiltrados" 
            @editar-empleado="handleEditarEmpleado" 
            @eliminar-empleado="handleEliminarEmpleado"
        />
    </div>
  </div>
</template>

<style scoped>
.formulario-container {
    /* esto mantiene el ancho máximo para que no se extienda por toda la pantalla */
    max-width: 450px; 
    
    margin: 0 auto 20px auto; 
}

/* Estilos de la Vista */
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
    background-color: #F0F0D8; 
    min-height: calc(100vh - 50px);
    padding: 20px;
    border-radius: 8px;
}
</style>