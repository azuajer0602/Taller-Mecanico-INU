<template>
  <!-- Sidebar -->
  <div class="sidebar">
    <div class="logo-container">
      <img id="logo-img" src="../assets/logo.png" alt="Logo Taller Mecánico">
    </div>
    <nav class="sidebar-nav">
      <a 
        href="#registro" 
        class="nav-link" 
        :class="{ active: currentView === 'registro' }"
        @click.prevent="$emit('cambiar-vista', 'registro')"
      >
        <span class="nav-icon">🚗</span>
        <span class="nav-text">Registro de Vehículos</span>
      </a>
      <a 
        href="#diagnostico" 
        class="nav-link" 
        :class="{ active: currentView === 'diagnostico' }"
        @click.prevent="$emit('cambiar-vista', 'diagnostico')"
      >
        <span class="nav-icon">🔧</span>
        <span class="nav-text">Diagnóstico Técnico</span>
      </a>
      <a 
        href="#historial" 
        class="nav-link" 
        :class="{ active: currentView === 'historial' }"
        @click.prevent="$emit('cambiar-vista', 'historial')"
      >
        <span class="nav-icon">📊</span>
        <span class="nav-text">Historial</span>
      </a>
    </nav>
    
    
  </div>
</template>

<script>
export default {
  name: 'SidebarComponent',
  props: {
    currentView: {
      type: String,
      required: true
    }
  },
  emits: ['cambiar-vista']
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
  background: linear-gradient(180deg, var(--color-orange) 0%, #d96a20 100%);
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
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
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
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
  flex: 1;
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
  border: none;
  background: none;
  width: 100%;
  text-align: left;
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

/* Footer del Sidebar */
.sidebar-footer {
  padding: 20px 15px;
  border-top: 2px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(3px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-icon {
  font-size: 18px;
}

.user-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.user-name {
  color: #FFFFFF;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.user-role {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
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
  
  .sidebar-footer {
    padding: 15px 10px;
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

/* Ajustes para el contenido principal */
:global(.main-layout) {
  margin-left: 280px;
  width: calc(100% - 280px);
}

:global(.content-area) {
  margin-left: 0;
  width: 100%;
}

@media screen and (max-width: 768px) {
  :global(.main-layout) {
    margin-left: 0;
    width: 100%;
  }
}
</style>