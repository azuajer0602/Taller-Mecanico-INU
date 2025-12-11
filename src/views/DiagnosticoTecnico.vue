<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, reactive, computed, onMounted } from 'vue';

const API_BASE = 'http://localhost:3000/api';

// --- ESTADOS DE DATOS ---
const vehiculosPendientes = ref([]);
const listaFallas = ref([]);
const listaAtributos = ref([]);

// --- ESTADO DEL FORMULARIO ---
const form = reactive({
  matricula: '',
  id_falla: '',
  respuestas: {} // Guardará { id_atributo: estado_seleccionado }
});

const loading = ref(false);

// --- ESTADOS DE LOS ATRIBUTOS (Hardcoded según tu indicación) ---
const opcionesEstado = [
  { val: 1, label: 'Bueno', color: 'text-success' },
  { val: 2, label: 'Malo', color: 'text-danger' },
  { val: 3, label: 'N/A', color: 'text-muted' }
];

// --- COMPUTED: DATOS READ-ONLY ---
const vehiculoSeleccionado = computed(() => {
  return vehiculosPendientes.value.find(v => v.matricula === form.matricula) || null;
});

const progresoInspeccion = computed(() => {
  if (listaAtributos.value.length === 0) return 0;
  const contestadas = Object.keys(form.respuestas).length;
  return Math.round((contestadas / listaAtributos.value.length) * 100);
});

const formularioValido = computed(() => {
  return form.matricula && 
         form.id_falla && 
         Object.keys(form.respuestas).length === listaAtributos.value.length;
});

// --- CARGA DE DATOS ---
const cargarDatosIniciales = async () => {
  loading.value = true;
  try {
    // 1. Cargar Vehículos (Usamos el endpoint que creamos antes 'findForDiagnostico')
    // Si no tienes ese endpoint, usa el de 'vehiculos' y filtra aquí en JS
    const resVeh = await fetch(`${API_BASE}/vehiculos/diagnostico`); 
    const dataVeh = await resVeh.json();
    if(dataVeh.success) vehiculosPendientes.value = dataVeh.data;

    // 2. Cargar Fallas
    const resFallas = await fetch(`${API_BASE}/fallas`);
    const dataFallas = await resFallas.json();
    if(dataFallas.success) listaFallas.value = dataFallas.data;

    // 3. Cargar Atributos (Checklist)
    const resAttr = await fetch(`${API_BASE}/atributos`);
    const dataAttr = await resAttr.json();
    if(dataAttr.success) listaAtributos.value = dataAttr.data;

  } catch (e) {
    console.error(e);
    alert("Error cargando datos del sistema");
  } finally {
    loading.value = false;
  }
};

// --- ENVIAR DIAGNÓSTICO ---
const guardarDiagnostico = async () => {
  if (!formularioValido.value) return;
  
  if(!confirm("¿Confirmar registro del diagnóstico? Esto cambiará el estado del vehículo.")) return;

  loading.value = true;
  
  // Transformar el objeto de respuestas a un array para el backend
  const resultadosArray = Object.entries(form.respuestas).map(([idAttr, valEstado]) => ({
    id_atributo: parseInt(idAttr),
    id_estado: valEstado
  }));

  const payload = {
    matricula: form.matricula,
    id_falla: form.id_falla,
    resultados_inspeccion: resultadosArray
  };

  try {
    const res = await fetch(`${API_BASE}/diagnosticos`, { // Ajusta a tu ruta real
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert("Diagnóstico y Servicio creados exitosamente ✅");
      // Limpiar y recargar
      Object.assign(form, { matricula: '', id_falla: '', respuestas: {} });
      cargarDatosIniciales();
    } else {
      alert("Error: " + data.message);
    }
  } catch (e) {
    alert("Error de conexión al servidor");
  } finally {
    loading.value = false;
  }
};

onMounted(cargarDatosIniciales);
</script>

<template>
  <div class="dashboard-container">
    <Side />
    <div class="main-content">
      
      <div class="dashboard-header animate-fade-in">
        <div class="header-content">
          <div>
            <h1 class="page-title">Diagnóstico de Entrada</h1>
            <p class="page-subtitle">Recepción y revisión técnica de vehículos</p>
          </div>
        </div>
      </div>

      <div class="row g-4">
        
        <div class="col-lg-4">
          <div class="content-card shadow-sm bg-white p-4 mb-4 border-top-primary">
            <h5 class="fw-bold text-primary mb-3">1. Selección de Vehículo</h5>
            
            <div class="mb-3">
              <label class="form-label small text-muted fw-bold">Vehículos Pendientes</label>
              <select v-model="form.matricula" class="form-select form-select-lg" :disabled="loading">
                <option value="" disabled>Seleccione vehículo...</option>
                <option v-for="v in vehiculosPendientes" :key="v.matricula" :value="v.matricula">
                  {{ v.matricula }} - {{ v.modelo }}
                </option>
              </select>
              <div v-if="vehiculosPendientes.length === 0" class="form-text text-warning">
                <i class="fas fa-exclamation-circle"></i> No hay vehículos esperando revisión.
              </div>
            </div>

            <div v-if="vehiculoSeleccionado" class="animate-fade-in mt-4">
              <hr class="text-muted">
              
              <div class="info-group mb-3">
                <label class="small text-uppercase text-muted fw-bold">Cliente</label>
                <div class="fw-bold text-dark fs-5">
                  {{ vehiculoSeleccionado.cliente_detalle?.nombre }} {{ vehiculoSeleccionado.cliente_detalle?.apellido }}
                </div>
                <div class="text-dark">CI: {{ vehiculoSeleccionado.cliente_detalle?.cedula }}</div>
              </div>

              <div class="info-group mb-3">
                <label class="small text-uppercase text-muted fw-bold">Vehículo</label>
                <div class="d-flex justify-content-between">
                  <span>Marca:</span>
                  <span class="fw-bold">{{ vehiculoSeleccionado.marca_detalle?.nombre_marca }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>Modelo:</span>
                  <span class="fw-bold">{{ vehiculoSeleccionado.modelo }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>Año:</span>
                  <span class="fw-bold">{{ vehiculoSeleccionado.afio }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>Color:</span>
                  <span class="fw-bold">{{ vehiculoSeleccionado.color }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="vehiculoSeleccionado" class="content-card shadow-sm bg-white p-4 border-top-warning animate-fade-in">
            <h5 class="fw-bold text-warning mb-3">2. Falla Reportada</h5>
            <label class="form-label small text-muted fw-bold">Motivo de Ingreso</label>
            <select v-model="form.id_falla" class="form-select">
              <option value="" disabled>Seleccione la falla principal...</option>
              <option v-for="f in listaFallas" :key="f.id_falla" :value="f.id_falla">
                {{ f.nombre_falla }}
              </option>
            </select>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="content-card shadow-sm bg-white h-100 p-0 border-top-success">
            <div class="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <h5 class="fw-bold text-success m-0">3. Checklist de Inspección</h5>
              <span class="badge bg-white text-dark border">
                Progreso: {{ progresoInspeccion }}%
              </span>
            </div>

            <div v-if="!vehiculoSeleccionado" class="text-center py-5 text-muted">
              <i class="fas fa-arrow-left fa-2x mb-3"></i>
              <p>Seleccione un vehículo para comenzar la inspección.</p>
            </div>

            <div v-else class="inspection-list p-4" style="max-height: 600px; overflow-y: auto;">
              
              <div v-for="attr in listaAtributos" :key="attr.id_atributo" class="inspection-item mb-3 p-3 border rounded">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <span class="fw-bold text-dark">{{ attr.nombre }}</span>
                  </div>
                  <div class="col-md-6">
                    <div class="btn-group w-100" role="group">
                      <input type="radio" class="btn-check" :name="'attr_'+attr.id_atributo" :id="'good_'+attr.id_atributo" :value="1" v-model="form.respuestas[attr.id_atributo]">
                      <label class="btn btn-outline-success btn-sm" :for="'good_'+attr.id_atributo">Bueno</label>

                      <input type="radio" class="btn-check" :name="'attr_'+attr.id_atributo" :id="'bad_'+attr.id_atributo" :value="2" v-model="form.respuestas[attr.id_atributo]">
                      <label class="btn btn-outline-danger btn-sm" :for="'bad_'+attr.id_atributo">Malo</label>

                      <input type="radio" class="btn-check" :name="'attr_'+attr.id_atributo" :id="'na_'+attr.id_atributo" :value="3" v-model="form.respuestas[attr.id_atributo]">
                      <label class="btn btn-outline-secondary btn-sm" :for="'na_'+attr.id_atributo">N/A</label>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div class="p-4 border-top bg-light">
              <button 
                @click="guardarDiagnostico" 
                class="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm"
                :disabled="!formularioValido || loading"
              >
                <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                {{ loading ? 'Guardando...' : 'Finalizar Diagnóstico y Generar Servicio' }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos Base reutilizados */
.dashboard-container { display: flex; min-height: 100vh; background-color: #f3f6f9; font-family: 'Poppins', sans-serif; }
.main-content { flex: 1; padding: 2rem; margin-left: 250px; transition: all 0.3s ease; }
.dashboard-header { background: white; padding: 1.5rem 2rem; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 2rem; }
.content-card { border-radius: 16px; overflow: hidden; }

/* Bordes Superiores de Colores */
.border-top-primary { border-top: 5px solid #4e73df; }
.border-top-warning { border-top: 5px solid #f6c23e; }
.border-top-success { border-top: 5px solid #1cc88a; }

.inspection-item { transition: background-color 0.2s; }
.inspection-item:hover { background-color: #f8f9fa; }

@media (max-width: 992px) { .main-content { margin-left: 0; padding: 1.5rem; } }
</style>