// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import DashboardComponent from "../components/DashboardComponent.vue";
import DiagnosticoTecnico from "../components/DiagnosticoTecnico.vue";
import Facturacion from "../views/Facturacion.vue";

const routes = [
  { path: "/", name: "Dashboard", component: DashboardComponent },
  { path: "/diagnostico", name: "DiagnosticoTecnico", component: DiagnosticoTecnico },
  { path: "/facturacion", name: "Facturacion", component: Facturacion },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
