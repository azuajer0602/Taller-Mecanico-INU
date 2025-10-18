<script setup>
import Side from '../components/SidebarComponent.vue';/*Importo el componente Sidebar*/
import { reactive } from 'vue';

const cliente = reactive({
  cedula: "",
  nombre: "",
  apellido: "",
  email: "",
  direccion: "",
  telefono:""
})

</script>

<template>
  <Side/>
  <div class="main-content">
    
    <div class="form-container">
      <div class="card client-form-card p-4 shadow-lg">
        
        <div class="text-center mb-4">
          <i class="fas fa-user-plus form-icon"></i>
          <h3 class="form-title">Registro de Nuevo Cliente</h3>
          <p class="form-subtitle">Completa los datos para añadir un cliente a la base de datos.</p>
        </div>
        
        <form @submit.prevent="submitForm">
          
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="cedula" class="form-label">Cédula</label>
              <input v-model="cliente.cedula" type="number" class="form-control form-control-lg" id="cedula" placeholder="Ingresar Cédula" required />
            </div>
            <div class="col-md-6">
              <label for="tlf" class="form-label">Teléfono</label>
              <input v-model="cliente.telefono" type="tel" class="form-control form-control-lg" id="tlf" placeholder="Ej: 0412-1234567" required />
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="name" class="form-label">Nombre</label>
              <input v-model="cliente.nombre" type="text" class="form-control" id="name" placeholder="Ingresar Nombre" required />
            </div>
            <div class="col-md-6">
              <label for="lastname" class="form-label">Apellido</label>
              <input v-model="cliente.apellido" type="text" class="form-control" id="lastname" placeholder="Ingresar Apellido" required />
            </div>
          </div>
          
          <div class="mb-3">
            <label for="email" class="form-label">Correo Electrónico</label>
            <input v-model="cliente.email" type="email" class="form-control" id="email" placeholder="Ingresar E-mail" />
          </div>

          <div class="mb-4">
            <label for="direccion" class="form-label">Dirección</label>
            <textarea v-model="cliente.direccion" class="form-control" id="direccion" rows="2" placeholder="Dirección completa del cliente"></textarea>
          </div>

          <div class="d-flex justify-content-between pt-2">
            <button type="button" class="btn btn-secondary-outline w-50 me-2">Cancelar</button>
            <button type="submit" class="btn btn-accent w-50">Registrar Cliente</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'RegistroClientes',
  methods: {
    submitForm() {
      console.log('Cliente a registrar:', this.cliente);
      alert(`Cliente ${this.cliente.nombre} ${this.cliente.apellido} registrado (simulado).`);
    }
  },
  mounted() {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    document.head.appendChild(link)
    
    const bootstrapCSS = document.createElement('link')
    bootstrapCSS.rel = 'stylesheet'
    bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css'
    document.head.appendChild(bootstrapCSS)
  }
}
</script>

<style scoped>
.main-content {
  padding: 20px;
  min-height: 100vh;
  margin-left: 250px; 
  background: linear-gradient(#ff7e5f, #feb47b);
  display: flex;
  justify-content: center;
  align-items: center;
}


.form-container {
    width: 100%;
    max-width: 800px;
    padding: 20px;
}


.client-form-card {
  background-color: #D8D8C0; 
  border-radius: 16px; 
  border: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); 
}


.form-icon {
    font-size: 40px;
    color: #DF8615; 
    margin-bottom: 10px;
}

.form-title {
    color: #2c3e50; 
    margin-bottom: 5px;
    font-weight: 700;
}

.form-subtitle {
    color: #7A8370;
    font-size: 14px;
    margin-bottom: 0;
}

.form-label {
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 14px;
}

.form-control {
    border: 2px solid #7A8370; 
    border-radius: 8px; 
    padding: 10px 15px;
    transition: all 0.3s ease;
    background-color: #f7f7f0; 
    color: #2c3e50;
}

.form-control:focus {
    border-color: #DF8615; 
    box-shadow: 0 0 0 0.25rem rgba(223, 134, 21, 0.25); 
}

.form-control::placeholder {
    color: #A0A0A0;
    font-style: italic;
}

.btn-accent {
  background-color: #DF8615; 
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  transition: background-color 0.3s ease;
}

.btn-accent:hover {
  background-color: #F84600; 
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


@media (max-width: 992px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
    align-items: flex-start; 
  }
  .form-container {
    padding: 0;
  }
}

.logo-fixed {
  display: none;
}
</style>