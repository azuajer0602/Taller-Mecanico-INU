<template>
  <div id="app">
    <SidebarComponent @change-view="setVista"/>
    <component :is="currentViewComponent" />
  </div>
</template>

<script>
import SidebarComponent from './components/SidebarComponent.vue'
import DashboardComponent from './components/DashboardComponent.vue'
import DiagnosticoTecnico from './components/DiagnosticoTecnico.vue'

export default {
  name: 'App',
  components: {
    SidebarComponent,
    DashboardComponent,
    DiagnosticoTecnico
  },
  data() {
    return {
      currentView: 'dashboard'
    }
  },
  computed: {
    currentViewComponent() {
      const components = {
        dashboard: 'DashboardComponent',
        servicios: 'DiagnosticoTecnico', // Aquí asignamos el componente de diagnóstico
        clientes: 'DashboardComponent', // Temporalmente dashboard
        contacto: 'DashboardComponent'  // Temporalmente dashboard
      }
      return components[this.currentView] || 'DashboardComponent'
    }
  },
  methods: {
    setVista(vista) {
      this.currentView = vista
      console.log('Vista cambiada a:', vista)
    }
  }
}
</script>

<style>
#app {
  display: flex;
  min-height: 100vh;
}


</style>