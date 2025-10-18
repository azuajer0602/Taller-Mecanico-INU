<script setup>
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
  <div class="container-fluid login-bg vh-100 position-relative">
    
    <img src="/logo.png" class="logo-fixed" alt="Vite logo" />

    <div class="d-flex justify-content-center align-items-center h-100">
      <div class="card login-card p-4 shadow">
        <h3 class="text-center mb-4 text-muted">Registro de Clientes</h3>
        <form>
          <div class="mb-3">
            <label for="cedula" class="form-label text-muted">Cédula</label>
            <input  v-model="cliente.cedula"   type="number" class="form-control" id="cedula" placeholder="Ingresar Cédula" />
          </div>
          <div class="mb-3">
            <label for="name" class="form-label text-muted">Nombre</label>
            <input v-model="cliente.nombre"  type="text" class="form-control" id="name" placeholder="Ingresar Nombre" />
          </div>
          <div class="mb-3">
            <label for="lastname" class="form-label text-muted">Apellido</label>
            <input v-model="cliente.apellido" type="text" class="form-control" id="lastname" placeholder="Ingresar Apellido" />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label text-muted">E-mail</label>
            <input v-model="cliente.email" type="email" class="form-control" id="email" placeholder="Ingresar Correo Electrónico" />
          </div>
          <div class="mb-3">
            <label for="direccion" class="form-label text-muted">Dirección</label>
            <input v-model="cliente.direccion" type="text" class="form-control" id="direccion" placeholder="Ingresar Dirección" />
          </div>
          <div class="mb-3">
            <label for="tlf" class="form-label text-muted">Teléfono</label>
            <input v-model="cliente.telefono" type="number" class="form-control" id="tlf" placeholder="Ingresar Teléfono" />
          </div>
          <div class="d-flex justify-content-between">
            <button type="submit" class="btn btn-accent w-50 me-2">Registrar</button>
            <button type="submit" class="btn btn-accent w-50">Cancelar</button>
          </div>
        </form>
        <div class="text-center mt-3 small text-muted">
          <a href="#">Términos de Servicio</a> | <a href="#">Política de Privacidad</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 🎯 Logo fijo en la esquina superior izquierda */
.logo-fixed {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 100px;
  height: auto;
  z-index: 10;
}

/* 🎨 Paleta personalizada */
.login-bg {
  background: linear-gradient(#ff7e5f, #feb47b); /* Degradado rojo-naranja */
}

.login-card {
  background-color: #D8D8C0; /* Beige grisáceo */
  border-radius: 12px;
  width: 100%;
  max-width: 360px;
}

.btn-accent {
  background-color: #DF8615; /* Mostaza */
  color: white;
  font-weight: bold;
  border: none;
}

.btn-accent:hover {
  background-color: #F84600; /* Naranja rojizo */
}

.form-control {
  border: 1px solid #7A8370; /* Verde oliva apagado */
  color: #7A8370;
}

.form-control::placeholder {
  color: #A0A0A0;
}

.text-muted {
  color: #000000 !important;
}
</style>
