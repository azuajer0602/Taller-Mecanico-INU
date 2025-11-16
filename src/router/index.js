import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import RegistroClientes from '../views/registro_clientes.vue'
import RegistroEmpleados from '../views/registro_empleados.vue'
import Inicio from '../components/SidebarComponent.vue'
import Dash from '../components/DashboardComponent.vue'
import Clientes from '../views/clientes.vue'


const routes = [
  { path: '/', component: Login },
  { path: '/registro', component: RegistroClientes },
  { path: '/regis_empleados', component: RegistroEmpleados },
  { path: '/sidebar', component:Inicio },
  { path: '/dash', component:Dash },
  { path: '/clientes',component:Clientes}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
