import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// ... tus importaciones de componentes ...
import Login from '../views/login.vue'
import AnalisisVentasView from '../views/AnalisisVentasView.vue'
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
import FallasView from '../views/FallasView.vue'
import marcas from '../views/MarcasView.vue'
import atributos from '../views/AtributosView.vue'
import serviciosadmin from '../views/ServicioAdminView.vue'
import serviciosempleado from '../views/ServicioEmpleadoView.vue'
const routes = [
  // ... tus rutas (sin cambios) ...
  { path: '/', component: Login },
  { path: '/ajustes',component: Ajustes, meta: { requiresAuth: true, allowedRoles: ['administrador'] }},
  { path: '/regis_empleados', component: RegistroEmpleados, meta: { requiresAuth: true, allowedRoles: ['administrador'] } },
  { path: '/sidebar', component:Inicio, meta: { requiresAuth: true, allowedRoles: ['administrador','mecanico'] } },
  { path: '/dash', component:Dash, meta: { requiresAuth: true, allowedRoles: ['administrador','mecanico'] } },
  { path: '/clientes',component:Clientes, meta: { requiresAuth: true, allowedRoles: ['administrador','mecanico'] }},
  { path: '/compra',component: compra , meta: { requiresAuth: true, allowedRoles: ['administrador'] }},
  { path: '/registroVehiculo',name: 'Registro',component: VehiculoRegistro, meta: { requiresAuth: true, allowedRoles: ['administrador','mecanico'] }},
  { path: '/diagnostico',name: 'Diagnostico',component: DiagnosticoTecnico, meta: { requiresAuth: true, allowedRoles: ['administrador','mecanico'] }},
  { path: '/facturacion', component: Facturacion, meta: { requiresAuth: true, allowedRoles: ['administrador'] } },
  { path: "/gestion-gastos", name: "GestionGastos", component: GestionGastos, meta: { requiresAuth: true, allowedRoles: ['administrador'] } },
  { path: '/flujo-caja', name: 'Flujo_caja', component: Flujo_caja, meta: { requiresAuth: true, allowedRoles: ['administrador'] }},
  { path: '/repuestos', component: repuestos, meta: { requiresAuth: true, allowedRoles: ['administrador','mecanico'] }},
  { path: '/proveedores', component: proveedores, meta: { requiresAuth: true, allowedRoles: ['administrador'] }},
   { path: '/marcas', component: marcas, meta: { requiresAuth: true, allowedRoles: ['administrador','mecanico'] }},
     { path: '/fallas', component: FallasView, meta: { requiresAuth: true, allowedRoles: ['administrador','mecanico'] }},
     { path: '/atributos', component: atributos, meta: { requiresAuth: true, allowedRoles: ['administrador','mecanico'] }},
     { path: '/serviciosadmin', component: serviciosadmin, meta: { requiresAuth: true, allowedRoles: ['administrador'] }},
     { path: '/serviciosempleado', component: serviciosempleado, meta: { requiresAuth: true, allowedRoles: ['mecanico'] }},
      { path: '/analisisventas', component:  AnalisisVentasView, meta: { requiresAuth: true, allowedRoles: ['administrador'] }}

     
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

// --- FUNCIÓN PARA CARGAR FUENTES Y ESTILOS GLOBALES ---
const cargarEstilosGlobales = () => {
  // 1. Cargar las librerías externas (Iconos, Bootstrap, Fuente Poppins)
  const links = [
    { id: 'fa-css', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' },
    { id: 'bs-css', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' },
    { id: 'font-css', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap' }
  ];

  links.forEach(linkInfo => {
    if (!document.getElementById(linkInfo.id)) {
      const link = document.createElement('link');
      link.id = linkInfo.id;
      link.rel = 'stylesheet';
      link.href = linkInfo.href;
      document.head.appendChild(link);
    }
  });

  // 2. APLICAR la fuente a toda la web (CSS inyectado)
  if (!document.getElementById('global-font-style')) {
    const style = document.createElement('style');
    style.id = 'global-font-style';
    style.innerHTML = `
      /* Aplicar Poppins a todo */
      body, #app, .modal-content, input, select, button, textarea, h1, h2, h3, h4, h5, h6, p, span, div, a {
        font-family: 'Poppins', sans-serif !important;
      }
      /* Ajuste opcional para que se vea más suave */
      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `;
    document.head.appendChild(style);
  }
};

// Ejecutamos la función inmediatamente para que aplique los cambios
cargarEstilosGlobales();
export default router