import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/login.vue";
import Registro_clientes from "../components/registro_clientes.vue";
import Registro_empleados from "../components/registro_empleados.vue";

const router = createRouter({
    history: createWebHistory,
    routes:[
        {
            path: "/",
            name: "login",
            component: Login 
        },
        {
            path: "/registro_clientes",
            name: "registro_clientes",
            component: Registro_clientes
        },
        {
            path: "/registro_empleados",
            name: "registro_clientes",
            component: Registro_empleados

        }
    ]
})

export default router;