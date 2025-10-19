<template>
  <div class="d-flex" id="wrapper">
    <SidebarComponent /> 
    
    <div id="page-content-wrapper" class="flex-grow-1 p-4">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import SidebarComponent from '@/components/SidebarComponent.vue'; // Asumiendo que @/ apunta a src/
import { RouterView } from 'vue-router'; // Necesario si se usa Vue Router
</script>

<style scoped>
/* Estilos básicos para la estructura */
#wrapper {
  min-height: 100vh;
}
#page-content-wrapper {
  padding-left: 250px; /* Ajusta este padding al ancho delsidebar */
}
</style>