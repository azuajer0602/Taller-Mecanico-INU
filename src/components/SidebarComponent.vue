<template>
  <!-- Sidebar -->
  <div class="sidebar">
    <div class="logo-container">
      <img id="logo-img" src="../assets/logo.png" alt="Logo">
    </div>
    <nav class="sidebar-nav">
      <a @click="cambiarVista('dashboard')" href="#" class="nav-link" :class="{ active: vistaActiva === 'dashboard' }">
        <span class="nav-icon">📊</span>
        <span class="nav-text">Dashboard</span>
      </a>
      <a @click="cambiarVista('servicios')" href="#" class="nav-link" :class="{ active: vistaActiva === 'servicios' }">
        <span class="nav-icon">🛠️</span>
        <span class="nav-text">Diagnóstico Técnico</span> <!-- Cambiado el texto -->
      </a>
      <a @click="cambiarVista('clientes')" href="#" class="nav-link" :class="{ active: vistaActiva === 'clientes' }">
        <span class="nav-icon">👥</span>
        <span class="nav-text">Clientes</span>
      </a>
      <a @click="cambiarVista('contacto')" href="#" class="nav-link" :class="{ active: vistaActiva === 'contacto' }">
        <span class="nav-icon">📧</span>
        <span class="nav-text">Contacto</span>
      </a>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'SidebarComponent',
  data() {
    return {
      vistaActiva: 'dashboard'
    }
  },
  methods: {
    cambiarVista(vista) {
      this.vistaActiva = vista
      this.$emit('change-view', vista)
    }
  }
}
</script>






<style scoped>
/* Sidebar Principal */
.sidebar {
  height: 100vh;
  width: 280px;
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  background: #df8615;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* Contenedor del Logo */
.logo-container {
  padding: 30px 20px 20px 20px;
  text-align: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;
}

#logo-img {
  width: 180px;
  height: 160px;
  object-fit: contain;
  border-radius: 10px;
  transition: transform 0.3s ease;
  background-color:#FFFFFF ;
}

#logo-img:hover {
  transform: scale(1.05);
}

/* Navegación */
.sidebar-nav {
  padding: 0 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  text-decoration: none;
  color: #FFFFFF;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: #FFFFFF;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
  color: #f8f9fa;
}

.nav-link:hover::before {
  transform: scaleY(1);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-link.active::before {
  transform: scaleY(1);
  background: #ffffff;
}

/* Iconos y Texto */
.nav-icon {
  font-size: 20px;
  margin-right: 15px;
  width: 24px;
  text-align: center;
  transition: transform 0.3s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.2);
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.3px;
  flex: 1;
}

/* Scrollbar Personalizado */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Responsive */
@media screen and (max-width: 768px) {
  .sidebar {
    width: 0;
    transform: translateX(-100%);
  }
  
  .sidebar.mobile-open {
    width: 280px;
    transform: translateX(0);
  }
  
  .logo-container {
    padding: 20px 15px 15px 15px;
  }
  
  #logo-img {
    width: 140px;
    height: 120px;
  }
  
  .nav-link {
    padding: 14px 16px;
  }
  
  .nav-text {
    font-size: 15px;
  }
}

@media screen and (max-width: 480px) {
  .sidebar {
    width: 100vw;
  }
  
  .sidebar.mobile-open {
    width: 100vw;
  }
  
  .logo-container {
    padding: 25px 20px;
  }
  
  #logo-img {
    width: 160px;
    height: 140px;
  }
}

/* Efectos de Animación */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nav-link {
  animation: slideIn 0.3s ease forwards;
}

.nav-link:nth-child(1) { animation-delay: 0.1s; }
.nav-link:nth-child(2) { animation-delay: 0.2s; }
.nav-link:nth-child(3) { animation-delay: 0.3s; }
.nav-link:nth-child(4) { animation-delay: 0.4s; }
</style>