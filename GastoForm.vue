<script setup>
import { ref } from 'vue'

const monto = ref('')
const descripcion = ref('')
const categoria = ref('')
const recibo = ref(null)

const categorias = [
  'Piezas',
  'Mano de Obra',
  'Herramientas',
  'Repuestos',
  'Servicios Externos',
  'Otros'
]

const handleSubmit = () => {
  const gasto = {
    monto: parseFloat(monto.value),
    descripcion: descripcion.value,
    categoria: categoria.value,
    recibo: recibo.value
  }
  console.log('Gasto registrado:', gasto)
  // Aquí se podría enviar a un backend o almacenar localmente
  alert('Gasto registrado exitosamente!')
  // Resetear formulario
  monto.value = ''
  descripcion.value = ''
  categoria.value = ''
  recibo.value = null
}

const handleFileChange = (event) => {
  recibo.value = event.target.files[0]
}
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-8 col-md-10">
        <div class="gasto-form card shadow-lg border-0 animate-fade-in-up" style="margin: 0 auto;">
          <div class="card-body p-4">
            <div class="form-header text-center mb-4">
              <h2 class="card-title h3 fw-bold text-dark mb-2 animate-bounce-in">
                📝 Registrar Nuevo Gasto
              </h2>
              <p class="text-muted mb-0 animate-fade-in-delay">
                Completa los detalles para registrar tu gasto
              </p>
            </div>
            <form @submit.prevent="handleSubmit" class="form-content">
              <div class="form-group mb-3">
                <label for="monto" class="form-label fw-semibold">
                  <span class="icon me-2">💰</span> Monto:
                </label>
                <input
                  id="monto"
                  v-model="monto"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 150.00"
                  class="form-control form-control-lg shadow-sm"
                />
              </div>

              <div class="form-group mb-3">
                <label for="descripcion" class="form-label fw-semibold">
                  <span class="icon me-2">📝</span> Descripción:
                </label>
                <input
                  id="descripcion"
                  v-model="descripcion"
                  type="text"
                  required
                  placeholder="Ej: Cena de negocios"
                  class="form-control form-control-lg shadow-sm"
                />
              </div>

              <div class="form-group mb-3">
                <label for="categoria" class="form-label fw-semibold">
                  <span class="icon me-2">🏷️</span> Categoría:
                </label>
                <select id="categoria" v-model="categoria" required class="form-select form-select-lg shadow-sm">
                  <option value="" disabled>Selecciona una categoría</option>
                  <option v-for="cat in categorias" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                </select>
              </div>

              <div class="form-group mb-4">
                <label for="recibo" class="form-label fw-semibold">
                  <span class="icon me-2">📎</span> Recibo:
                </label>
                <input
                  id="recibo"
                  type="file"
                  accept="image/*,.pdf"
                  @change="handleFileChange"
                  class="form-control form-control-lg shadow-sm"
                />
              </div>

              <button type="submit" class="submit-btn btn btn-primary btn-lg w-100 shadow-lg animate-pulse-hover">
                <span class="btn-icon me-2">✅</span> Registrar Gasto
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gasto-form {
  background: #ffffff;
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(139, 69, 19, 0.2);
  animation: fadeInUp 1s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%; /* Ocupa el ancho disponible del contenedor padre */
  max-width: 900px; /* Aumentamos el ancho máximo a 900px */
}

.gasto-form:hover {
  transform: translateY(-5px);
  box-shadow: 0 35px 100px rgba(139, 69, 19, 0.3);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out;
}

.animate-bounce-in {
  animation: bounceIn 1s ease-out;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-delay {
  animation: fadeIn 1.5s ease-out 0.5s both;
}

.animate-pulse-hover:hover {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.form-label {
  color: #4a3c28;
  font-weight: 600;
}

.icon {
  font-size: 1.5em;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
  transition: transform 0.3s ease;
}

.icon:hover {
  transform: scale(1.1);
}

.btn-primary {
  background: #F84600;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  color: #ffffff;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #654321 0%, #8b4513 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(139, 69, 19, 0.4);
}

.btn-icon {
  font-size: 1.2em;
}

/* Responsive */
@media (max-width: 768px) {
  .gasto-form {
    margin: 1rem;
  }

  .card-body {
    padding: 2rem;
  }
}
</style>
