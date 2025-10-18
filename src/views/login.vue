<template>
    <div>

  </div>
  <div class="container-fluid login-bg d-flex justify-content-center align-items-center vh-100">
    <div class="card login-card p-4 shadow">

          <img src="/logo.png" class="logo" alt="Vite logo" />
      <h3 class="text-center mb-4 text-muted">Iniciar Sesión</h3>
      <form>
        <div class="mb-3">
          <label for="username" class="form-label text-muted">Usuario</label>
          <input type="text" class="form-control" id="username" placeholder="Ingresa tu usuario" />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label text-muted">Contraseña</label>
          <input type="password" class="form-control" id="password" placeholder="Ingresa tu contraseña" />
        </div>
        
        <router-link to="/dash" class="btn btn-accent w-100">Ingresar</router-link>

      </form>
      <div class="text-center mt-3 small text-muted">
        <a href="#">Términos de Servicio</a> | <a href="#">Política de Privacidad</a>
      </div>
    </div>
  </div>
</template>

<style scoped>


/* 🎨 Paleta personalizada */
.login-bg {
  background: #df8615;
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