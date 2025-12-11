<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, onMounted, computed } from 'vue';

const API_BASE = 'http://localhost:3000/api';
const marcas = ref([]);
const nombreMarca = ref('');
const editandoId = ref(null);
const loading = ref(false);
const mensaje = ref('');

const cargarMarcas = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/marcas`);
    const data = await res.json();
    if(data.success) marcas.value = data.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const guardarMarca = async () => {
  if(!nombreMarca.value.trim()) return;
  
  const url = editandoId.value ? `${API_BASE}/marcas/${editandoId.value}` : `${API_BASE}/marcas`;
  const method = editandoId.value ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nombre_marca: nombreMarca.value })
    });
    const data = await res.json();
    if(data.success) {
      cargarMarcas();
      cancelarEdicion();
      mensaje.value = data.message;
      setTimeout(() => mensaje.value = '', 3000);
    }
  } catch (e) {
    console.error(e);
  }
};

const editar = (marca) => {
  nombreMarca.value = marca.nombre_marca;
  editandoId.value = marca.id_marca;
};

const eliminar = async (id) => {
  if(!confirm('¿Eliminar marca?')) return;
  try {
    const res = await fetch(`${API_BASE}/marcas/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if(data.success) cargarMarcas();
    else alert(data.message);
  } catch (e) {
    console.error(e);
  }
};

const cancelarEdicion = () => {
  nombreMarca.value = '';
  editandoId.value = null;
};

onMounted(cargarMarcas);
</script>

<template>
  <Side/>
  <div class="main-content">
    <div class="container-fluid">
      <h2 class="mb-4"><i class="fas fa-tags me-2"></i>Gestión de Marcas</h2>
      
      <div class="card mb-4 shadow-sm">
        <div class="card-body d-flex gap-2 align-items-end">
          <div class="flex-grow-1">
            <label class="form-label">Nombre de la Marca</label>
            <input v-model="nombreMarca" type="text" class="form-control" placeholder="Ej: Toyota, Ford...">
          </div>
          <button @click="guardarMarca" class="btn btn-primary">
            <i class="fas" :class="editandoId ? 'fa-save' : 'fa-plus'"></i> {{ editandoId ? 'Actualizar' : 'Agregar' }}
          </button>
          <button v-if="editandoId" @click="cancelarEdicion" class="btn btn-secondary">Cancelar</button>
        </div>
      </div>

      <div v-if="mensaje" class="alert alert-success">{{ mensaje }}</div>

      <div class="card shadow-sm">
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="marca in marcas" :key="marca.id_marca">
                <td>{{ marca.id_marca }}</td>
                <td>{{ marca.nombre_marca }}</td>
                <td class="text-end">
                  <button @click="editar(marca)" class="btn btn-sm btn-outline-warning me-2"><i class="fas fa-edit"></i></button>
                  <button @click="eliminar(marca.id_marca)" class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
}
/* Estilos similares a tu VehiculoView */
</style>