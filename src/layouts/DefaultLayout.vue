<template>
  <div class="d-flex flex-nowrap" id="wrapper">
    <SidebarComponent /> 
    
    <div id="page-content-wrapper" class="content-view-container flex-grow-1 p-4">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import SidebarComponent from '../components/SidebarComponent.vue'; 
import { RouterView } from 'vue-router'; 
</script>

<style scoped>
.content-view-container {
  margin-left: 250px; 
  width: calc(100% - 250px); 
  box-sizing: border-box; 
  min-height: 100vh;
}

@media (max-width: 768px) {
  .content-view-container {
    margin-left: 0;
    width: 100%;
  }
}

#wrapper {
  overflow-x: hidden;
}
</style>