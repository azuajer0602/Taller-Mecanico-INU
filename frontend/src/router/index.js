import { createRouter, createWebHistory } from 'vue-router'
import VehiculoRegistro from '../components/VehiculoRegistro.vue'
import DiagnosticoTecnico from '../components/DiagnosticoTecnico.vue'

const routes = [
  {
    path: '/',
    redirect: '/registro'
  },
  {
    path: '/registro',
    name: 'Registro',
    component: VehiculoRegistro
  },
  {
    path: '/diagnostico',
    name: 'Diagnostico',
    component: DiagnosticoTecnico
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router