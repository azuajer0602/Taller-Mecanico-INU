import { createRouter, createWebHistory } from "vue-router";
import DashboardComponent from "../components/DashboardComponent.vue";
import DiagnosticoTecnico from "../components/DiagnosticoTecnico.vue";
import Facturacion from "../views/Facturacion.vue";
import GestionGastos from "../views/GestionGastos.vue";

const routes = [
  { path: "/", name: "Dashboard", component: DashboardComponent },
  { path: "/diagnostico", name: "DiagnosticoTecnico", component: DiagnosticoTecnico },
  { path: "/facturacion", name: "Facturacion", component: Facturacion },
  { path: "/gestion-gastos", name: "GestionGastos", component: GestionGastos },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
