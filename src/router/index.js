import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import RegistroClientes from '../views/registro_clientes.vue'
import RegistroEmpleados from '../views/registro_empleados.vue'
import Inicio from '../components/SidebarComponent.vue'
import Dash from '../components/DashboardComponent.vue'
import Clientes from '../views/clientes.vue'
import VehiculoRegistro from '../views/VehiculoRegistro.vue'
import DiagnosticoTecnico from '../views/DiagnosticoTecnico.vue'
import Facturacion from '../views/Facturacion.vue'
import GestionGastos from "../views/GestionGastos.vue";
import Flujo_caja from '../views/Flujo_caja.vue'
import repuestos  from '../views/repuestos.vue'
import proveedores from '../views/proveedores.vue'


const routes = [
  { path: '/', component: Login },
  { path: '/registro', component: RegistroClientes },
  { path: '/regis_empleados', component: RegistroEmpleados },
  { path: '/sidebar', component:Inicio },
  { path: '/dash', component:Dash },
  { path: '/clientes',component:Clientes},
  { path: '/registroVehiculo',name: 'Registro',component: VehiculoRegistro},
  { path: '/diagnostico',name: 'Diagnostico',component: DiagnosticoTecnico},
  { path: '/facturacion', component: Facturacion },
  { path: "/gestion-gastos", name: "GestionGastos", component: GestionGastos },
  { path: '/flujo-caja', name: 'Flujo_caja', component: Flujo_caja},
  { path: '/repuestos', component: repuestos},
  { path: '/proveedores', component: proveedores}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
