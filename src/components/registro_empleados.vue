<script setup>
</script>

<template>
  <div class="container-fluid login-bg vh-100 position-relative">
    <!-- Logo en esquina superior derecha -->
    <img src="/logo.png" class="logo-fixed" alt="Vite logo" />

    <!-- Card centrado -->
    <div class="d-flex justify-content-center align-items-center h-100">
      <div class="card login-card p-4 shadow">
        <h3 class="text-center mb-4 text-muted">Registro de Empleados</h3>
        <form>
          <div class="mb-3">
            <label for="username" class="form-label text-muted">Usuario</label>
            <input type="text" class="form-control" id="username" placeholder="Ingresa tu usuario" />
          </div>
          <div class="mb-3">
            <label for="name" class="form-label text-muted">Nombre</label>
            <input type="text" class="form-control" id="name" placeholder="Ingresar Nombre" />
          </div>
          <div class="mb-3">
            <label for="lastname" class="form-label text-muted">Apellido</label>
            <input type="text" class="form-control" id="lastname" placeholder="Ingresar Apellido" />
          </div>
          <div class="mb-3">
            <label for="position" class="form-label text-muted">Cargo</label>
            <input type="text" class="form-control" id="position" placeholder="Cargo" />
          </div>
          <div class="mb-3">
            <label for="date_contratacion" class="form-label text-muted">Fecha Contratación</label>
            <input type="date" class="form-control" id="date_contratacion" />
          </div>
          <div class="mb-3">
            <label for="sueldo" class="form-label text-muted">Sueldo Base</label>
            <input type="text" class="form-control" id="sueldo" placeholder="Sueldo" />
          </div>
          <div class="d-flex justify-content-between">
            <button type="submit" class="btn btn-accent w-50 me-2">Registrar</button>
            <button type="button" class="btn btn-outline-secondary w-50">Cancelar</button>
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

.btn-outline-secondary {
  border: 1px solid #7A8370;
  color: #7A8370;
  background-color: transparent;
}

.btn-outline-secondary:hover {
  background-color: #7A8370;
  color: white;
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