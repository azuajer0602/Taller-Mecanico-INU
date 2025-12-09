import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'


import Login from '../views/login.vue'
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
import compra from '../views/compraRepuestos.vue'
import Ajustes from'../views/Ajustes.vue'



const routes = [
  { path: '/', component: Login },
  { path: '/ajustes',component: Ajustes, meta: {    requiresAuth: true, allowedRoles: ['administrador'] }},
  { path: '/regis_empleados', component: RegistroEmpleados, meta: {    requiresAuth: true, allowedRoles: ['administrador'] } },
  { path: '/sidebar', component:Inicio, meta: {    requiresAuth: true, allowedRoles: ['administrador','mecanico'] } },
  { path: '/dash', component:Dash, meta: {    requiresAuth: true, allowedRoles: ['administrador','mecanico'] } },
  { path: '/clientes',component:Clientes, meta: {    requiresAuth: true, allowedRoles: ['administrador','mecanico'] }},
  { path: '/compra',component: compra , meta: {    requiresAuth: true, allowedRoles: ['administrador'] }},
  { path: '/registroVehiculo',name: 'Registro',component: VehiculoRegistro, meta: {    requiresAuth: true, allowedRoles: ['administrador','mecanico'] }},
  { path: '/diagnostico',name: 'Diagnostico',component: DiagnosticoTecnico, meta: {    requiresAuth: true, allowedRoles: ['administrador','mecanico'] }},
  { path: '/facturacion', component: Facturacion, meta: {    requiresAuth: true, allowedRoles: ['administrador'] } },
  { path: "/gestion-gastos", name: "GestionGastos", component: GestionGastos, meta: {    requiresAuth: true, allowedRoles: ['administrador'] } },
  { path: '/flujo-caja', name: 'Flujo_caja', component: Flujo_caja, meta: {    requiresAuth: true, allowedRoles: ['administrador'] }},
  { path: '/repuestos', component: repuestos, meta: {    requiresAuth: true, allowedRoles: ['administrador','mecanico'] }},
  { path: '/proveedores', component: proveedores, meta: {    requiresAuth: true, allowedRoles: ['administrador'] }}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const cargoUsuario = authStore.userCargo ? authStore.userCargo.toLowerCase() : null;
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next('/'); 
    }

    if (to.meta.allowedRoles) {
        const allowedRoles = to.meta.allowedRoles.map(role => role.toLowerCase());
        
        if (!allowedRoles.includes(cargoUsuario)) {
            
            alert("Acceso denegado. No tienes permisos para esta sección.");
            return next('/dash');
        }
    }
    next();
});

export default router
