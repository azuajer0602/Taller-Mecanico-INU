<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();

// Estado para controlar si el sidebar está abierto o cerrado en móvil
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
   this.user = null;
  this.token = null;
  localStorage.clear();
   setAuthHeader(null);
  router.push('/');
}

</script>

<template>
  <div>
    <button class="hamburger-btn" @click="toggleSidebar">
      <span class="hamburger-icon" :class="{ 'open': isSidebarOpen }">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>

    <div 
      class="sidebar-overlay" 
      :class="{ 'show': isSidebarOpen }" 
      @click="closeSidebar"
    ></div>

    <div class="sidebar" :class="{ 'mobile-open': isSidebarOpen }">
      <div class="logo-container">
        <img id="logo-img" src="../assets/logo.png" alt="Logo">
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/dash" class="nav-link" :class="{ active: $route.path === '/dash' }" @click="closeSidebar">
          <span class="nav-icon">🚗</span>
          <span class="nav-text">Dashboard</span>
        </router-link>
        <li v-if="!authStore.isMecanico">
        <router-link to="/ajustes" class="nav-link" :class="{ active: $route.path === '/ajustes' }" @click="closeSidebar">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">Ajustes</span>
        </router-link>
        </li>

        <li v-if="!authStore.isMecanico">
        <router-link to="/compra" class="nav-link" :class="{ active: $route.path === '/compra' }" @click="closeSidebar">
          <span class="nav-icon">🛒</span>
          <span class="nav-text">Compra Repuestos</span>
        </router-link>
        </li>


        <li v-if="!authStore.isMecanico">
        <router-link to="/facturacion" class="nav-link" :class="{ active: $route.path === '/facturacion' }" @click="closeSidebar">
          <span class="nav-icon">🧾</span>
          <span class="nav-text">Facturación</span>
        </router-link>
        </li>

        <li v-if="!authStore.isMecanico">

        <router-link to="/gestion-gastos" class="nav-link" :class="{ active: $route.path === '/gestion-gastos' }" @click="closeSidebar">
          <span class="nav-icon">💸</span>
          <span class="nav-text">Gestión y Gastos</span>
        </router-link>
        </li>
        <li v-if="!authStore.isMecanico">
        
        <router-link to="/flujo-caja" class="nav-link" :class="{ active: $route.path === '/flujo-caja' }" @click="closeSidebar">
          <span class="nav-icon">📈</span>
          <span class="nav-text">Flujo de transacciones</span>
        </router-link>
        </li>

        <a href="#servicios" class="nav-link" @click="closeSidebar">
          <span class="nav-icon">🛠️</span>
          <span class="nav-text">Servicios</span>
        </a>

        <router-link to="/clientes" class="nav-link" :class="{ active: $route.path === '/clientes' }" @click="closeSidebar">
          <span class="nav-icon">👥</span>
          <span class="nav-text">Clientes</span>
        </router-link>


        <li v-if="!authStore.isMecanico">
        <router-link to="/regis_empleados" class="nav-link" :class="{ active: $route.path === '/regis_empleados' }" @click="closeSidebar">
          <span class="nav-icon">👔</span>
          <span class="nav-text">Empleados</span>
        </router-link>
        </li>
        
        <router-link to="/registroVehiculo" class="nav-link" :class="{ active: $route.path === '/registroVehiculo' }" @click="closeSidebar">
          <span class="nav-icon">🚗</span>
          <span class="nav-text">Registro de Vehículos</span>
        </router-link>


        <li v-if="!authStore.isMecanico">
        <router-link to="/proveedores" class="nav-link" :class="{ active: $route.path === '/proveedores' }" @click="closeSidebar">
          <span class="nav-icon">🚚</span>
          <span class="nav-text">Proveedores</span>
        </router-link>
        </li>

        <router-link to="/repuestos" class="nav-link" :class="{ active: $route.path === '/repuestos' }" @click="closeSidebar">
          <span class="nav-icon">📦</span>
          <span class="nav-text">Inventario</span>
        </router-link>
        
        <router-link to="/diagnostico" class="nav-link" :class="{ active: $route.path === '/diagnostico' }" @click="closeSidebar">
          <span class="nav-icon">🔧</span>
          <span class="nav-text">Diagnóstico Técnico</span>
        </router-link>

        <a href="#contacto" class="nav-link" @click="closeSidebar">
          <span class="nav-icon">📧</span>
          <span class="nav-text">Contacto</span>
        </a>

        <router-link 
    to="/" 
    class="nav-link" 
    :class="{ active: $route.path === '/' }" 
    
    @click.prevent="handleLogout(); closeSidebar()" 
    
>
    <span class="nav-icon">🚪</span>
    <span class="nav-text">Salir</span>
</router-link>
      </nav>
    </div>
  </div>
</template>

<style scoped>
/* =========================================
   ESTILOS GENERALES
   ========================================= */
.router-link-active,
.nav-link {
  text-decoration: none;
  color: inherit;
}

/* Sidebar Principal */
.sidebar {
  height: 100vh;
  width: 280px;
  position: fixed;
  z-index: 1001; /* Está DEBAJO del botón hamburguesa (1002) */
  top: 0;
  left: 0;
  background: #df8615;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

/* Contenedor del Logo */
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

/* Navegación */
.sidebar-nav {
  padding: 0 15px 20px 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  color: #FFFFFF;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
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
}

.nav-link:hover::before {
  transform: scaleY(1);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-link.active::before {
  transform: scaleY(1);
  background: #ffffff;
}

.nav-icon {
  font-size: 20px;
  margin-right: 15px;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* Scrollbar */
.sidebar::-webkit-scrollbar {
  width: 6px;
}
.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}
.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

/* =========================================
   ESTILOS DEL BOTÓN HAMBURGUESA
   ========================================= */
.hamburger-btn {
  display: none; /* Oculto en PC */
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1002; /* Siempre visible por encima del sidebar */
  background: #df8615;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  color: white;
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 25px;
  height: 18px;
}

.hamburger-icon span {
  display: block;
  height: 3px;
  width: 100%;
  background-color: white;
  border-radius: 3px;
  transition: all 0.3s ease;
}

/* Animación a X */
.hamburger-icon.open span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}
.hamburger-icon.open span:nth-child(2) {
  opacity: 0;
}
.hamburger-icon.open span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* =========================================
   OVERLAY
   ========================================= */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.sidebar-overlay.show {
  opacity: 1;
  visibility: visible;
}

/* =========================================
   RESPONSIVE
   ========================================= */
@media screen and (max-width: 992px) {
  .hamburger-btn {
    display: block;
  }

  /* Sidebar escondido a la izquierda */
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
    box-shadow: none;
  }

  /* Sidebar abierto (entra desde la izquierda) */
  .sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.2);
  }
}
</style>