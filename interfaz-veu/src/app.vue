<template>
  <div class="app-container">
    <SidebarComponent 
      :currentView="currentView" 
      @cambiar-vista="cambiarVista" 
    />
    
    <div class="main-layout">
      <main class="content-area">
        <VehiculoRegistro 
          v-if="currentView === 'registro'" 
        />
        
        <DiagnosticoTecnico 
          v-if="currentView === 'diagnostico'" 
        />
        
        <HistorialDiagnosticos 
          v-if="currentView === 'historial'" 
        />
      </main>
    </div>
  </div>
</template>

<script>
import SidebarComponent from './components/SidebarComponent.vue'
import VehiculoRegistro from './components/VehiculoRegistro.vue'
import DiagnosticoTecnico from './components/DiagnosticoTecnico.vue'
import HistorialDiagnosticos from './components/HistorialDiagnosticos.vue'

export default {
  name: 'App',
  components: {
    SidebarComponent,
    VehiculoRegistro,
    DiagnosticoTecnico,
    HistorialDiagnosticos
  },
  data() {
    return {
      currentView: 'registro'
    }
  },
  methods: {
    cambiarVista(vista) {
      this.currentView = vista
    }
  }
}
</script>

<style>
:root {
  --color-yellow: #F5E1A4;
  --color-olive: #D9D593;
  --color-orange: #EE7F27;
  --color-red: #BC162A;
  --color-dark: #302325;
  --color-light: #f8f9fa;
  --color-white: #ffffff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--color-light);
  color: var(--color-dark);
}

.app-container {
  min-height: 100vh;
  display: flex;
}

.main-layout {
  flex: 1;
  margin-left: 280px;
  min-height: 100vh;
}

.content-area {
  padding: 2rem;
  background: linear-gradient(135deg, var(--color-light) 0%, var(--color-yellow) 100%);
  min-height: 100vh;
}

/* Utilidades de color */
.bg-yellow { background-color: var(--color-yellow); }
.bg-olive { background-color: var(--color-olive); }
.bg-orange { background-color: var(--color-orange); }
.bg-red { background-color: var(--color-red); }
.bg-dark { background-color: var(--color-dark); }

.text-yellow { color: var(--color-yellow); }
.text-olive { color: var(--color-olive); }
.text-orange { color: var(--color-orange); }
.text-red { color: var(--color-red); }
.text-dark { color: var(--color-dark); }

.btn-orange {
  background-color: var(--color-orange);
  border-color: var(--color-orange);
  color: white;
}

.btn-orange:hover {
  background-color: #d96a20;
  border-color: #d96a20;
}

.btn-red {
  background-color: var(--color-red);
  border-color: var(--color-red);
  color: white;
}

.btn-red:hover {
  background-color: #a01223;
  border-color: #a01223;
}

/* Responsive */
@media screen and (max-width: 768px) {
  .main-layout {
    margin-left: 0;
    width: 100%;
  }
}
</style>