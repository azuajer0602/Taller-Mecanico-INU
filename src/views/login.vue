<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const usuario = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter(); 
const handleLogin = async () => {

  errorMessage.value = '';

  if (!usuario.value || !password.value) {
    errorMessage.value = 'Por favor, ingresa tu usuario y contraseña.';
    return;
  }

  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      usuario: usuario.value, 
      password: password.value,
    });
    if (response.data.message === 'Login exitoso') {
      console.log('Login Exitoso!', response.data.empleado);

      router.push('/dash');
    }

  } catch (error) {

    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      // Mensaje genérico para otros errores de red o servidor
      errorMessage.value = 'Ocurrió un error al intentar iniciar sesión. Intenta de nuevo.';
      console.error('Error de red/servidor:', error);
    }
  }
};
</script>

<template>
  <div class="container-fluid login-bg d-flex justify-content-center align-items-center vh-100">
    <div class="card login-card p-4 shadow">
      <img src="/logo.png" class="logo" alt="Vite logo" />
      <h3 class="text-center mb-4 text-muted">Iniciar Sesión</h3>

      <form @submit.prevent="handleLogin"> 
        <div class="mb-3">
        <label for="username" class="form-label text-muted">Usuario</label>
        <input type="text" class="form-control" id="username" placeholder="Ingresa tu usuario" v-model="usuario" required />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label text-muted">Contraseña</label>
        <input type="password" class="form-control" id="password" placeholder="Ingresa tu contraseña" v-model="password" required />
      </div>
        
        <div v-if="errorMessage" class="alert alert-danger small text-center" role="alert">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="btn btn-accent w-100 mb-2">Ingresar</button>

        </form>

      <div class="text-center mt-3 small text-muted">
        <a href="#">Términos de Servicio</a> | <a href="#">Política de Privacidad</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tu CSS existente */
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