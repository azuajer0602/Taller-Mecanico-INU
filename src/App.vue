<template>
  <div id="app">
    <SidebarComponent />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import SidebarComponent from "./components/SidebarComponent.vue";

export default {
  name: "App",
  components: {
    SidebarComponent,
  },
};
</script>

<style>
#app {
  display: flex;
  min-height: 100vh;
}
.content {
  flex: 1;
  margin-left: 280px;
  background: #f8f9fa;
}
</style>
