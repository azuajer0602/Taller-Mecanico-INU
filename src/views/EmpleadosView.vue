<script setup>
import { ref, onMounted, computed } from 'vue';
import EmpleadosTabla from '../components/Empleados/EmpleadosTabla.vue'; 
import EmpleadoFormulario from '../components/Empleados/EmpleadoFormulario.vue'; 
import ConnectionTest from '../components/ConnectionTest.vue';
import { empleadosService } from '../services/api.js';

// estado central del sistema
const empleados = ref([]);
const mostrarFormulario = ref(false); 
const terminoBusqueda = ref('');
const empleadoSeleccionado = ref(null); 
const loading = ref(false);
const error = ref(null);

const estaEnModoFormulario = computed(() => {
    return mostrarFormulario.value || empleadoSeleccionado.value !== null;
});

// ✅ CORREGIDO: Cargar empleados desde la API real
const cargarEmpleados = async () => {
    loading.value = true;
    error.value = null;
    try {
        console.log('🔄 Cargando empleados desde API...');
        const response = await empleadosService.getEmpleados();
        console.log('📦 Respuesta del backend:', response);
        
        // ✅ ESTRUCTURA CORRECTA: response.data contiene el array de empleados
        if (response && response.success && Array.isArray(response.data)) {
            console.log(`✅ Encontrados ${response.data.length} empleados`);
            
            // ✅ ADAPTACIÓN CORRECTA: Mapear los datos reales del backend
            empleados.value = response.data.map(empleado => {
                console.log('📝 Procesando empleado real:', empleado);
                return {
                    id_empleado: empleado.id_empleado || empleado.id,
                    usuario: empleado.usuario,
                    contrasena: '********', // Por seguridad
                    nombre_emp: empleado.nombre_emp || empleado.nombre,
                    apellido_emp: empleado.apellido_emp || empleado.apellido || '',
                    cedula_emp: empleado.cedula_emp || empleado.cedula || '',
                    cargo: empleado.cargo,
                    sueldo_base: empleado.sueldo_base || 0,
                    fecha_contratacion: empleado.fecha_contratacion || new Date().toISOString().split('T')[0]
                };
            });
            
            console.log('✅ Empleados cargados correctamente:', empleados.value);
        } else {
            console.error('❌ Estructura inesperada:', response);
            throw new Error('Estructura de datos inesperada del servidor');
        }
        
    } catch (err) {
        console.error('❌ Error cargando empleados:', err);
        error.value = 'Error al cargar los empleados desde el servidor: ' + err.message;
        // ❌ QUITAR datos simulados - mejor mostrar error claro
        empleados.value = []; // Vaciar en lugar de usar datos falsos
    } finally {
        loading.value = false;
    }
};

// ✅ CORREGIDO: Lógica de eventos CRUD
const handleGuardarEmpleado = async (empleado) => {
    loading.value = true;
    error.value = null;
    
    try {
        // ✅ PREPARAR DATOS CORRECTOS para el backend
        const datosParaAPI = {
            usuario: empleado.usuario,
            contrasena: empleado.contrasena !== '********' ? empleado.contrasena : 'password123', // Contraseña por defecto si no se cambia
            nombre_emp: empleado.nombre_emp,
            apellido_emp: empleado.apellido_emp,
            cedula_emp: empleado.cedula_emp,
            cargo: empleado.cargo,
            fecha_contratacion: empleado.fecha_contratacion,
            sueldo_base: parseFloat(empleado.sueldo_base) || 0
        };

        if (empleado.id_empleado) {
            // Edición
            await empleadosService.updateEmpleado(empleado.id_empleado, datosParaAPI);
            alert(`✅ Empleado ${empleado.nombre_emp} actualizado con éxito.`);
        } else {
            // Nuevo registro
            const nuevoEmpleado = await empleadosService.createEmpleado(datosParaAPI);
            alert(`✅ Empleado ${empleado.nombre_emp} registrado exitosamente.`);
        }

        // Recargar la lista
        await cargarEmpleados();
        
    } catch (err) {
        console.error('❌ Error guardando empleado:', err);
        error.value = 'Error al guardar el empleado: ' + err.message;
        alert('❌ Error al guardar el empleado: ' + err.message);
    } finally {
        loading.value = false;
        mostrarFormulario.value = false;
        empleadoSeleccionado.value = null;
    }
};

const handleEditarEmpleado = (empleado) => {
    empleadoSeleccionado.value = empleado;
    mostrarFormulario.value = true;
};

const handleEliminarEmpleado = async (id) => {
    const confirmacion = confirm("¿Está seguro de eliminar este empleado?");
    if (confirmacion) {
        try {
            await empleadosService.deleteEmpleado(id);
            alert(`✅ Empleado eliminado correctamente.`);
            await cargarEmpleados();
        } catch (err) {
            console.error('❌ Error eliminando empleado:', err);
            error.value = 'Error al eliminar el empleado: ' + err.message;
            alert('❌ Error al eliminar el empleado: ' + err.message);
        }
    }
};

const handleCancelar = () => {
    mostrarFormulario.value = false;
    empleadoSeleccionado.value = null;
    error.value = null;
};

// Lógica de filtrado en búsqueda
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

onMounted(() => {
    cargarEmpleados();
});
</script>

<template>
  <div class="container my-5 empleados-view-container">
    <h1 class="mb-4 display-5 text-center">GESTIÓN DE EMPLEADOS</h1> 

    <!-- Componente de prueba de conexión -->
    <ConnectionTest />

    <!-- Mostrar errores -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error:</strong> {{ error }}
        <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center my-3">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2">Cargando empleados...</p>
    </div>

    <!-- Mensaje cuando no hay empleados -->
    <div v-if="!loading && empleados.length === 0 && !error" class="alert alert-info text-center">
        <strong>ℹ️ No hay empleados registrados</strong>
        <p class="mb-0">Haz clic en "Registrar Nuevo Empleado" para agregar el primero.</p>
    </div>

    <div class="formulario-container mb-4" v-show="estaEnModoFormulario">
        <EmpleadoFormulario 
            :empleado-a-editar="empleadoSeleccionado"
            @guardar-empleado="handleGuardarEmpleado" 
            @cancelar-edicion="handleCancelar"
            :loading="loading"
        />
    </div>

    <div v-if="!loading && empleados.length > 0">
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
.btn-primary:disabled {
    background-color: #6c757d;
    border-color: #6c757d;
}
.empleados-view-container {
    background-color: #F0F0D8; 
    min-height: calc(100vh - 50px);
    padding: 20px;
    border-radius: 8px;
}
</style>