<script setup>
import Side from '../components/SidebarComponent.vue';
import { reactive } from 'vue';

// Se agrega el reactive para simular el manejo de datos del empleado
const empleado = reactive({
  usuario: "",
  nombre: "",
  apellido: "",
  cargo: "",
  fechaContratacion: "",
  sueldo: ""
})
</script>

<template>
  <!-- Asumiendo que SidebarComponent.vue gestiona su propio layout y estilos -->
  <Side/>
  <div class="main-content">
    
    <!-- Contenedor del Formulario -->
    <div class="form-container">
      <div class="card employee-form-card p-4 shadow-lg">
        
        <!-- Encabezado del Formulario -->
        <div class="text-center mb-4">
          <i class="fas fa-id-badge form-icon"></i>
          <h3 class="form-title">Registro de Nuevo Empleado</h3>
          <p class="form-subtitle">Ingresa los datos del nuevo colaborador para el sistema.</p>
        </div>
        
        <form @submit.prevent="submitForm">
          
          <!-- Fila 1: Usuario (Full Width) -->
          <div class="mb-3">
            <label for="username" class="form-label">Usuario (Login)</label>
            <input v-model="empleado.usuario" type="text" class="form-control form-control-lg" id="username" placeholder="Ingresar nombre de usuario" required />
          </div>

          <!-- Fila 2: Nombre y Apellido -->
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="name" class="form-label">Nombre</label>
              <input v-model="empleado.nombre" type="text" class="form-control" id="name" placeholder="Ingresar Nombre" required />
            </div>
            <div class="col-md-6">
              <label for="lastname" class="form-label">Apellido</label>
              <input v-model="empleado.apellido" type="text" class="form-control" id="lastname" placeholder="Ingresar Apellido" required />
            </div>
          </div>
          
          <!-- Fila 3: Cargo y Fecha de Contratación -->
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="position" class="form-label">Cargo</label>
              <input v-model="empleado.cargo" type="text" class="form-control" id="position" placeholder="Ej: Gerente de Ventas" required />
            </div>
            <div class="col-md-6">
              <label for="date_contratacion" class="form-label">Fecha Contratación</label>
              <input v-model="empleado.fechaContratacion" type="date" class="form-control" id="date_contratacion" required />
            </div>
          </div>
          
          <!-- Fila 4: Sueldo Base -->
          <div class="mb-4">
            <label for="sueldo" class="form-label">Sueldo Base ($)</label>
            <input v-model="empleado.sueldo" type="number" step="0.01" class="form-control" id="sueldo" placeholder="Ingresar Sueldo Base" required />
          </div>

          <!-- Botones -->
          <div class="d-flex justify-content-between pt-2">
            <button type="button" class="btn btn-secondary-outline w-50 me-2">Cancelar</button>
            <button type="submit" class="btn btn-accent w-50">Registrar Empleado</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
// Se incluye la lógica del componente fuera del <script setup> para el manejo de la función submitForm y la carga de estilos
export default {
  name: 'RegistroEmpleados',
  methods: {
    submitForm() {
      console.log('Empleado a registrar:', this.empleado);
      // Simulación de registro
      alert(`Empleado ${this.empleado.nombre} ${this.empleado.apellido} registrado (simulado).`);
    }
  },
  mounted() {
    // Agregar Font Awesome (asumiendo que no está cargado globalmente)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    document.head.appendChild(link)
    
    // Agregar Bootstrap CSS (asumiendo que no está cargado globalmente)
    const bootstrapCSS = document.createElement('link')
    bootstrapCSS.rel = 'stylesheet'
    bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css'
    document.head.appendChild(bootstrapCSS)
  }
}
</script>

<style scoped>
/* Estilos Generales del Layout */
.main-content {
  padding: 20px;
  min-height: 100vh;
  margin-left: 250px; /* Espacio para el Sidebar */
  background: linear-gradient(#ff7e5f, #feb47b); /* Degradado rojo-naranja mantenido */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Contenedor del Formulario */
.form-container {
    width: 100%;
    max-width: 600px; /* Ancho ajustado para este formulario */
    padding: 20px;
}

/* Tarjeta del Formulario */
.employee-form-card {
  background-color: #D8D8C0; /* Beige grisáceo mantenido */
  border-radius: 16px; /* Bordes más redondeados */
  border: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); /* Sombra más pronunciada */
}

/* Encabezado */
.form-icon {
    font-size: 40px;
    color: #DF8615; /* Mostaza */
    margin-bottom: 10px;
}

.form-title {
    color: #2c3e50; /* Un color oscuro para mejor contraste */
    margin-bottom: 5px;
    font-weight: 700;
}

.form-subtitle {
    color: #7A8370;
    font-size: 14px;
    margin-bottom: 0;
}

/* Estilos de los Inputs y Labels */
.form-label {
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 14px;
}

.form-control {
    border: 2px solid #7A8370; /* Borde más visible */
    border-radius: 8px; /* Bordes redondeados */
    padding: 10px 15px;
    transition: all 0.3s ease;
    background-color: #f7f7f0; /* Un fondo ligeramente más claro para los campos */
    color: #2c3e50;
}

.form-control:focus {
    border-color: #DF8615; /* Resaltar con el color mostaza al enfocar */
    box-shadow: 0 0 0 0.25rem rgba(223, 134, 21, 0.25); /* Sombra de enfoque con color mostaza */
}

.form-control::placeholder {
    color: #A0A0A0;
    font-style: italic;
}

/* Estilo específico para input[type="date"] para que se vea bien */
.form-control[type="date"] {
    appearance: none;
    padding-right: 15px;
}


/* Botones de Acción */
.btn-accent {
  background-color: #DF8615; /* Mostaza mantenido */
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  transition: background-color 0.3s ease;
}

.btn-accent:hover {
  background-color: #F84600; /* Naranja rojizo mantenido */
  color: white;
}

.btn-secondary-outline {
    background-color: transparent;
    color: #7A8370;
    border: 2px solid #7A8370;
    font-weight: bold;
    border-radius: 8px;
    padding: 10px 20px;
    transition: all 0.3s ease;
}

.btn-secondary-outline:hover {
    background-color: #7A8370;
    color: #D8D8C0;
}

/* Ajustes para el Sidebar que se mantiene en la izquierda */
@media (max-width: 992px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
    align-items: flex-start; /* Ajustar en móviles */
  }
  .form-container {
    padding: 0;
  }
}

.logo-fixed {
  display: none;
}
</style>