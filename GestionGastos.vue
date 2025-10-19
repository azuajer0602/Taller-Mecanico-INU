<template>
  <div class="gastos-container">
    <h1>💸 Gestión de Gastos</h1>
    
    <!-- Tarjeta para mostrar el total de gastos -->
    <div class="total-gastos-card">
      <h4>Total de Gastos Registrados</h4>
      <p class="total-monto">${{ totalGastos.toFixed(2) }}</p>
    </div>

    <form @submit.prevent="guardarGasto">
      <div class="form-section">
        <h3>{{ modoEdicion ? '✏️ Editar Gasto' : 'Registrar Nuevo Gasto' }}</h3>

        <label for="monto">Monto del Gasto ($):</label>
        <input id="monto" v-model.number="gasto.monto" type="number" step="0.01" placeholder="Ej: 150.50" required />

        <label for="descripcion">Descripción:</label>
        <textarea id="descripcion" v-model="gasto.descripcion" rows="3" placeholder="Ej: Compra de repuestos para motor" required></textarea>

        <label for="categoria">Categoría:</label>
        <select id="categoria" v-model="gasto.categoria" required>
          <option disabled value="">Seleccione una categoría</option>
          <option>Repuestos y Materiales</option>
          <option>Salarios y Personal</option>
          <option>Alquiler y Servicios Públicos</option>
          <option>Herramientas y Equipamiento</option>
          <option>Marketing y Publicidad</option>
          <option>Gastos Administrativos</option>
          <option>Otros</option>
        </select>

        <label for="factura">Adjuntar Factura (Opcional):</label>
        <input id="factura" type="file" @change="handleFileUpload" />

      </div>

      <div class="form-section acciones">
        <button type="submit" class="btn-registrar">💾 {{ modoEdicion ? 'Guardar Cambios' : 'Registrar Gasto' }}</button>
        <button v-if="modoEdicion" type="button" @click="cancelarEdicion" class="btn-cancelar">❌ Cancelar</button>
      </div>
    </form>

    <!-- Sección para mostrar los gastos registrados -->
    <div class="lista-gastos-section">
      <h3>Historial de Gastos</h3>

      <!-- Barra de búsqueda -->
      <div class="busqueda-container">
        <input type="text" v-model="terminoBusqueda" placeholder="🔍 Buscar por descripción..." class="input-busqueda" />
      </div>

      <div v-if="gastosFiltrados.length === 0" class="no-gastos">
        <p>{{ gastosRegistrados.length > 0 ? 'No se encontraron gastos que coincidan con la búsqueda.' : 'Aún no se han registrado gastos.' }}</p>
      </div>
      <table v-else class="tabla-gastos">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="gastoItem in gastosFiltrados" :key="gastoItem.id">
            <td>{{ gastoItem.fecha }}</td>
            <td>${{ gastoItem.monto.toFixed(2) }}</td>
            <td>{{ gastoItem.descripcion }}</td>
            <td>{{ gastoItem.categoria }}</td>
            <td>
              <button @click="iniciarEdicion(gastoItem)" class="btn-editar">✏️ Editar</button>
              <button @click="eliminarGasto(gastoItem.id)" class="btn-eliminar">🗑️ Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

// Estado reactivo para el formulario de gasto
const gasto = ref({
  monto: null,
  descripcion: '',
  categoria: '',
  archivoFactura: null
});

// Estado para el modo edición
const gastoEnEdicionId = ref(null);
const modoEdicion = computed(() => gastoEnEdicionId.value !== null);

// Estado para la barra de búsqueda
const terminoBusqueda = ref('');


const STORAGE_KEY = 'historial-gastos';

// Estado reactivo para la lista de gastos
const gastosRegistrados = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));

// Guardar en localStorage cada vez que la lista de gastos cambie
watch(gastosRegistrados, (gastos) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gastos));
}, { deep: true });

onMounted(() => {
  // Esto asegura que si el localStorage se modifica desde otra pestaña, se actualice.
});

// Propiedad computada para calcular el total de gastos
const totalGastos = computed(() => {
  return gastosRegistrados.value.reduce((total, gasto) => total + gasto.monto, 0);
});

// Propiedad computada para filtrar los gastos según la búsqueda
const gastosFiltrados = computed(() => {
  if (!terminoBusqueda.value) {
    return gastosRegistrados.value;
  }
  return gastosRegistrados.value.filter(gasto =>
    gasto.descripcion.toLowerCase().includes(terminoBusqueda.value.toLowerCase())
  );
});

// Maneja la subida del archivo
const handleFileUpload = (event) => {
  gasto.value.archivoFactura = event.target.files[0];
};

// Lógica para eliminar un gasto
const eliminarGasto = (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
    gastosRegistrados.value = gastosRegistrados.value.filter(g => g.id !== id);
  }
};

// Lógica para iniciar la edición de un gasto
const iniciarEdicion = (gastoAEditar) => {
  gastoEnEdicionId.value = gastoAEditar.id;
  // Hacemos una copia para no modificar el original hasta guardar
  gasto.value = { ...gastoAEditar };
  // El input de archivo no se puede rellenar programáticamente por seguridad
  document.getElementById('factura').value = null;
  gasto.value.archivoFactura = null;

  // Opcional: desplazar la vista hacia el formulario
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Lógica para cancelar la edición
const cancelarEdicion = () => {
  gastoEnEdicionId.value = null;
  // Limpia el formulario
  gasto.value = {
    monto: null,
    descripcion: '',
    categoria: '',
    archivoFactura: null
  };
  document.getElementById('factura').value = null;
};

// Lógica para registrar o actualizar un gasto
const guardarGasto = () => {
  if (modoEdicion.value) {
    // Actualizar gasto existente
    const index = gastosRegistrados.value.findIndex(g => g.id === gastoEnEdicionId.value);
    if (index !== -1) {
      gastosRegistrados.value[index] = { ...gastosRegistrados.value[index], ...gasto.value };
    }
    alert('✅ ¡Gasto actualizado correctamente!');
    cancelarEdicion(); // Resetea el formulario y el modo edición
    return;
  }

  // Creamos un nuevo objeto de gasto con un ID y fecha
  const nuevoGasto = {
    id: Date.now(),
    fecha: new Date().toLocaleDateString(),
    monto: gasto.value.monto,
    descripcion: gasto.value.descripcion,
    categoria: gasto.value.categoria,
    factura: gasto.value.archivoFactura ? gasto.value.archivoFactura.name : 'No adjunta'
  };

  gastosRegistrados.value.unshift(nuevoGasto); // Añadimos el nuevo gasto al inicio de la lista
  // Muestra el mensaje de éxito
  alert('✅ ¡Gasto registrado correctamente!');
  
  // Limpia el formulario
  cancelarEdicion();
};
</script>

<style scoped>
.gastos-container {
  width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 30px; /* Ajustamos el padding para la vista de pantalla completa */
  background: #f9f9f9;
  border-radius: 0; /* Quitamos los bordes redondeados */
  box-shadow: none; /* Quitamos la sombra */
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
}

.total-gastos-card {
  background: linear-gradient(135deg, #df8615, #c9740c);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 30px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.total-gastos-card h4 {
  margin: 0;
  font-weight: 600;
  font-size: 1.2em;
}

.total-gastos-card .total-monto {
  font-size: 2.5em;
  font-weight: bold;
  margin: 10px 0 0 0;
  letter-spacing: 1px;
}

.form-section {
  background: #ffffff;
  padding: 40px; /* Aumentamos el padding para hacerlo más grande */
  margin-bottom: 20px;
  border-radius: 8px;
  border-left: 5px solid #df8615;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}

input[type="file"] {
  padding: 5px;
}

.btn-registrar {
  background: #df8615;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s;
  width: 100%;
}
.acciones {
  display: flex;
  gap: 10px;
}

.btn-registrar:hover {
  background: #c9740c;
}

.btn-cancelar {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s;
  width: 100%;
}

.btn-cancelar:hover {
  background-color: #5a6268;
}

.btn-editar {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  margin-right: 5px; /* Espacio entre botones */
}

.btn-editar:hover {
  background-color: #2980b9;
}

.btn-eliminar {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-eliminar:hover {
  background-color: #c0392b;
}

.lista-gastos-section {
  background: #ffffff;
  padding: 30px;
  margin-top: 30px;
  border-radius: 8px;
  border-left: 5px solid #4a90e2; /* Color azul para diferenciar la sección */
}

.busqueda-container {
  margin-bottom: 20px;
}

.input-busqueda {
  width: 100%;
  padding: 10px 15px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box; /* Asegura que el padding no afecte el ancho total */
}

.no-gastos {
  text-align: center;
  color: #777;
  padding: 20px;
  font-style: italic;
}

.tabla-gastos {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.tabla-gastos th, .tabla-gastos td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
  vertical-align: middle;
}

.tabla-gastos th {
  background-color: #f2f2f2;
  font-weight: 600;
  color: #333;
}

</style>
