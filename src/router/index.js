import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import EmpleadosView from '@/views/EmpleadosView.vue';

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: DefaultLayout, // Usa el layout como componente principal
    children: [
      {
        path: 'empleados', // La ruta será /empleados
        name: 'Empleados',
        component: EmpleadosView, // carga la vista de empleados dentro del layout
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