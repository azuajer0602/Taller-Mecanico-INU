<script setup>
import Side from '../components/SidebarComponent.vue'; /*Importo el componente Sidebar*/
import { reactive } from 'vue';


const proveedor = reactive({
  id_provedor: "",
  nombre_fiscal: "",
  rif_juridico: "",
  telefono_proveedor: "",
  direccion_proveedor: ""
})
</script>

<template>
  <Side/>
  <div class="main-content">
    
    
    <div class="form-container">
      <div class="card employee-form-card p-4 shadow-lg">
        
        
        <div class="text-center mb-4">
          <i class="fas fa-id-badge form-icon"></i>
          <h3 class="form-title">Registro de proveedores</h3>
          <p class="form-subtitle">Ingresa los datos del nuevo colaborador para el sistema.</p>
        </div>
        
        <form @submit.prevent="submitForm">
          
          
          <div class="mb-3">
            <label for="username" class="form-label">ID Provedor</label>
            <input v-model="proveedor.id_provedor" type="text" class="form-control form-control-lg" id="username" placeholder="ID" required />
          </div>

          
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="name" class="form-label">Nombre Fiscal</label>
              <input v-model="proveedor.nombre_fiscal" type="text" class="form-control" id="name" placeholder="Nombre" required />
            </div>
            <div class="col-md-6">
              <label for="lastname" class="form-label">RIF</label>
              <input v-model="proveedor.rif_juridico" type="text" class="form-control" id="lastname" placeholder="RIF" required />
            </div>
          </div>
          
          
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="position" class="form-label">TELEFONO</label>
              <input v-model="proveedor.telefono_proveedor" type="text" class="form-control" id="position" placeholder="TLF" required />
            </div>
            <div class="col-md-6">
              <label for="date_contratacion" class="form-label">Direccion</label>
              <input v-model="proveedor.direccion_proveedor" type="text" class="form-control" id="date_contratacion" required />
            </div>
          </div>
        
          <div class="d-flex justify-content-between pt-2">
            <button type="button" class="btn btn-secondary-outline w-50 me-2">Cancelar</button>
            <button type="submit" class="btn btn-accent w-50">Registrar Provedor</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

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
    max-width: 600px; 
    padding: 20px;
}


.employee-form-card {
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


.form-control[type="date"] {
    appearance: none;
    padding-right: 15px;
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