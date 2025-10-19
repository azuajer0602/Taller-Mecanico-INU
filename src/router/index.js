import { createRouter, createWebHistory } from 'vue-router';

import DefaultLayout from '../layouts/DefaultLayout.vue'; 
import EmpleadosView from '../views/EmpleadosView.vue'; 

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: DefaultLayout,
    children: [
      {
        path: 'empleados',
        name: 'Empleados',
        component: EmpleadosView,
        meta: { title: 'Gestión de Empleados' }
      },
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;