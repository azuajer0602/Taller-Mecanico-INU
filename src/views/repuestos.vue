<script setup>
import Side from '../components/SidebarComponent.vue';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
// Importaciones para PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE = 'http://localhost:3000/api';
const authStore = useAuthStore();

const API_BASE_URL = 'http://localhost:3000/api/repuestos';

const usuarioIniciales = computed(() => {
  if (!authStore.user) return 'A';
  
  const nombreCompleto = authStore.user.nombre_emp || authStore.user.nombre || '';
  
  if (!nombreCompleto) {
    return (authStore.user.usuario || 'A').charAt(0).toUpperCase();
  }
  
  const partes = nombreCompleto.split(' ');
  if (partes.length >= 2) {
    return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase();
  } else {
    return partes[0].charAt(0).toUpperCase();
  }
});

const nombreCompleto = computed(() => {
  if (!authStore.user) return 'Administrador';
  
  return authStore.user.nombre_emp || 
         authStore.user.nombre || 
         authStore.user.usuario || 
         'Administrador';
});

// Computed para el cargo
const usuarioCargo = computed(() => {
  if (!authStore.user || !authStore.user.cargo) return 'MecanoSoft';
  return authStore.user.cargo;
});

// --- ESTADOS ---
const repuestos = ref([]);
const cargando = ref(false);
const error = ref(null);
const busqueda = ref('');

// --- COMPUTED ---
const totalRepuestos = computed(() => repuestos.value.length);

const repuestosFiltrados = computed(() => {
  if (!busqueda.value) return repuestos.value;
  const lower = busqueda.value.toLowerCase();
  return repuestos.value.filter(r => 
    r.id_repuesto?.toString().toLowerCase().includes(lower) ||
    r.nombre_repuesto?.toLowerCase().includes(lower) ||
    r.desc_repuesto?.toLowerCase().includes(lower)
  );
});

// --- MÉTODOS ---
const cargarRepuestos = async () => {
  cargando.value = true;
  error.value = null;
  try {
    const response = await axios.get(`${API_BASE_URL}/obtenerRep`);
    repuestos.value = response.data.repuestos || response.data;
  } catch (err) {
    console.error('Error al cargar repuestos:', err);
    error.value = `Error: ${err.response?.status || 'Conexión'} - ${err.response?.data?.message || err.message}`;
  } finally {
    cargando.value = false;
  }
};

// --- EXPORTAR PDF ---
const exportarAPDF = async () => {
  const tabla = document.querySelector('.table-responsive');
  
  if (!tabla) {
    alert("No se encontró el elemento de la tabla para exportar.");
    return;
  }

  try {
    // Obtener la imagen del logo como base64
    const logoImg = document.getElementById('logo-img');
    let logoBase64 = null;
    
    if (logoImg) {
      const logoCanvas = await html2canvas(logoImg, {
        scale: 1,
        logging: false,
        useCORS: true,
        backgroundColor: '#FFFFFF'
      });
      logoBase64 = logoCanvas.toDataURL('image/png');
    }

    const canvas = await html2canvas(tabla, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Agregar el logo si está disponible
    if (logoBase64) {
      pdf.addImage(logoBase64, 'PNG', 10, 10, 40, 35); // Ajusta tamaño y posición
      pdf.setFontSize(18);
      pdf.text("Inventario de Repuestos", 60, 25);
    } else {
      pdf.setFontSize(18);
      pdf.text("Inventario de Repuestos", 105, 15, null, null, "center");
    }
    
    pdf.setFontSize(10);
    pdf.text(`Fecha: ${new Date().toLocaleDateString()} | Total: ${totalRepuestos.value} repuestos`, 105, 32, null, null, "center");

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 190;
    const pageHeight = 295;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    // Posición después del header (logo + título)
    let position = logoBase64 ? 45 : 40;
    
    if (imgHeight < pageHeight - position) {
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    } else {
      let currentPage = 1;
      let heightLeft = imgHeight;
      
      while (heightLeft >= 0) {
        if (currentPage > 1) {
          pdf.addPage();
          position = 10;
        }
        
        pdf.addImage(imgData, 'PNG', 10, position - heightLeft, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);
        currentPage++;
      }
    }

    pdf.save(`inventario_repuestos_${new Date().toISOString().slice(0,10)}.pdf`);
  } catch (err) {
    console.error('Error al generar el PDF:', err);
    alert('Hubo un error al generar el PDF.');
  }
};

onMounted(() => {
  cargarRepuestos();
});
</script>

<template>
  <div class="dashboard-container">
    <Side />
    
    <div class="main-content">
      
      <div class="dashboard-header animate-fade-in">
        
        <div class="header-content">
          <div class="logo-container">
        <img id="logo-img" src="../assets/logo.png" alt="Logo">
      </div>
          <div>
            <h1 class="page-title">Inventario de Repuestos</h1>
            <p class="page-subtitle">Lista completa de repuestos disponibles en el taller</p>
          </div>
          <div class="user-profile">
            <div class="avatar-circle">{{ usuarioIniciales }}</div>
            <div>
              <div class="user-name">{{ nombreCompleto }}</div>
              <div class="user-role">{{ usuarioCargo }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4 g-3">
        <div class="col-md-12">
          <div class="metric-card info-card h-100">
            <div>
              <div class="metric-value">{{ totalRepuestos }}</div>
              <div class="metric-label">Repuestos en Inventario</div>
            </div>
            <div class="metric-icon-container bg-info-soft">
              <i class="fas fa-boxes text-info"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card shadow-sm bg-white">
        
        <div class="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="search-box position-relative" style="min-width: 250px;">
            <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 50%; transform: translateY(-50%);"></i>
            <input 
              v-model="busqueda" 
              type="text" 
              class="form-control ps-5" 
              placeholder="Buscar por ID, nombre o descripción..."
            >
          </div>
          <button class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm" @click="exportarAPDF">
            <i class="fas fa-file-pdf me-2"></i> Exportar a PDF
          </button>
        </div>

        <div class="table-responsive">
          <table class="table custom-table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Repuesto</th>
                <th>Descripción</th>
                <th>Precio Unitario</th>
                <th>Stock Disponible</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rep in repuestosFiltrados" :key="rep.id_repuesto" class="hover-row">
                <td data-label="ID">
                  <span class="badge bg-light text-dark border fw-bold px-3 py-2">
                    {{ rep.id_repuesto }}
                  </span>
                </td>
                <td data-label="Repuesto">
                  <div class="d-flex align-items-center">
                    <div class="client-avatar-small me-2 bg-info-soft">
                      <i class="fas fa-cog text-info"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ rep.nombre_repuesto }}</div>
                    </div>
                  </div>
                </td>
                <td data-label="Descripción">
                  <div class="text-muted small">{{ rep.desc_repuesto || 'Sin descripción' }}</div>
                </td>
                <td data-label="Precio">
                  <div class="fw-bold text-dark">
                    {{ parseFloat(rep.precio_unitario || 0).toLocaleString('es-VE', { style: 'currency', currency: 'VES' }) }}
                  </div>
                </td>
                <td data-label="Stock">
                  <div :class="{
                    'badge': true,
                    'bg-success-soft text-success px-3 rounded-pill': rep.stock_inventario >= 10,
                    'bg-warning-soft text-warning px-3 rounded-pill': rep.stock_inventario < 10 && rep.stock_inventario > 0,
                    'bg-danger-soft text-danger px-3 rounded-pill': rep.stock_inventario <= 0
                  }">
                    {{ rep.stock_inventario }} unidades
                  </div>
                </td>
              </tr>
              
              <!-- Estado de carga -->
              <tr v-if="cargando">
                <td colspan="5" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                  <p class="mt-2 text-muted">Cargando inventario...</p>
                </td>
              </tr>
              
              <!-- Error -->
              <tr v-else-if="error">
                <td colspan="5" class="text-center py-5 text-danger">
                  <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                  <p>{{ error }}</p>
                </td>
              </tr>
              
              <!-- Sin resultados -->
              <tr v-else-if="repuestosFiltrados.length === 0 && !cargando">
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                  <p>No se encontraron repuestos</p>
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
/* ESTILOS BASE - Mismos que la vista de vehículos */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f3f6f9;
  font-family: 'Poppins', sans-serif;
}

.logo-container {
  padding: 30px 20px 20px 20px;
  text-align: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;
}

#logo-img {
  width: 160px;
  height: 140px;
  object-fit: contain;
  border-radius: 10px;
  background-color: #FFFFFF;
  transition: transform 0.3s ease;
}

#logo-img:hover {
  transform: scale(1.05);
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-left: 250px;
  transition: all 0.3s ease;
}

/* Header */
.dashboard-header {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title { font-size: 1.5rem; font-weight: 700; color: #2c3e50; margin: 0; }
.page-subtitle { color: #95a5a6; font-size: 0.9rem; margin-top: 5px; }

/* Perfil */
.user-profile {
  display: flex; align-items: center; gap: 15px;
  padding: 8px 15px; background: #f8f9fa; border-radius: 50px;
}
.avatar-circle {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}
.user-name { font-weight: 600; font-size: 0.9rem; color: #2c3e50; }
.user-role { font-size: 0.75rem; color: #95a5a6; }

/* Tarjetas Métricas */
.metric-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  height: 100%;
  border-left: 5px solid transparent;
}

.info-card { border-left-color: #36b9cc; }

.metric-value { font-size: 2rem; font-weight: 700; color: #2c3e50; line-height: 1.2; }
.metric-label { color: #858796; font-size: 0.9rem; margin-top: 5px; font-weight: 500; }

.metric-icon-container {
  width: 60px; height: 60px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
}
.bg-info-soft { background-color: rgba(54, 185, 204, 0.1); }
.bg-success-soft { background-color: rgba(28, 200, 138, 0.1); }
.bg-warning-soft { background-color: rgba(246, 194, 62, 0.1); }
.bg-danger-soft { background-color: rgba(231, 74, 59, 0.1); }

/* Tabla */
.content-card { border-radius: 16px; overflow: hidden; }
.custom-table th {
  font-weight: 600; text-transform: uppercase; font-size: 0.75rem;
  color: #858796; padding: 1rem; background-color: #f8f9fc; border-bottom: 2px solid #e3e6f0;
}
.custom-table td { padding: 1rem; border-bottom: 1px solid #f0f2f5; vertical-align: middle; }
.hover-row:hover { background-color: #f8f9fc; }

.client-avatar-small {
  width: 35px; height: 35px; background-color: #e2e6ea;
  color: #6c757d; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9rem;
}

.btn-icon {
  width: 32px; height: 32px; padding: 0;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: all 0.2s; border: none; background: transparent;
}
.btn-icon:hover { transform: scale(1.1); background-color: #f1f3f9; }

/* Animaciones */
.animate-fade-in { animation: fadeIn 0.5s ease; }

@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}

/* Responsive */
@media (max-width: 992px) {
  .main-content { margin-left: 0; padding: 1.5rem; }
  .dashboard-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
}

@media (max-width: 768px) {
  .custom-table thead { display: none; }
  .custom-table, .custom-table tbody, .custom-table tr, .custom-table td { 
    display: block; width: 100%; 
  }
  .custom-table tr {
    margin-bottom: 1rem; background: white; border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 1rem; border: 1px solid #e3e6f0;
  }
  .custom-table td {
    padding: 0.5rem 0; text-align: right; border: none; 
    display: flex; justify-content: space-between; align-items: center;
  }
  .custom-table td::before {
    content: attr(data-label); font-weight: 600; color: #858796; font-size: 0.85rem;
  }
  
}
</style>