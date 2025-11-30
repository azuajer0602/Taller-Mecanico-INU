import express from 'express';
import empleadoController from './modelos/empleados/controlador.js';

const router = express.Router();

console.log('🆕 [NUEVO ROUTER] Cargado correctamente');

router.get('/lista', (req, res) => {
    console.log('🆕 [NUEVO] Ruta /lista ejecutada');
    empleadoController.obtenerEmpleados(req, res);
});

export { router as empleadosRouterNuevo };