<template>
  <div class="d-flex" id="wrapper">
    <SidebarComponent /> 
    
    <div id="page-content-wrapper" class="flex-grow-1 p-4">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import SidebarComponent from '../components/SidebarComponent.vue'; 
import { RouterView } from 'vue-router'; 
</script>

<style scoped>
#page-content-wrapper {
margin-left: 280px;
padding-left: 280px; 
}
/* -------------------------------------------
   ESTILOS GENERALES (Pantallas GRANDES/Desktop)
   ------------------------------------------- */
.content-wrapper {
  /* Establece el margen para el sidebar en desktop */
  margin-left: 250px;
  padding: 20px; 
  /* Asegura que el contenido use todo el espacio restante */
  width: auto;
  min-height: 100vh;
}

/* -------------------------------------------
   MEDIA QUERY para Pantallas PEQUEÑAS (Mobile)
   ------------------------------------------- */
@media (max-width: 768px) {
  /* En pantallas más pequeñas que 768px (tablets y móviles): */


  .sidebar-component {
    left: -250px; 
  }

  .content-wrapper {
    margin-left: 0;
    padding: 10px; 
  }
}

.sidebar-component {
    position: fixed;
    height: 100vh;
}
</style>