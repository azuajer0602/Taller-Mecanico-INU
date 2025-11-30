import express from 'express';
import empleadoController from './controlador.js';

const router = express.Router();

console.log('✅ [INICIO] rutas.js cargado - configurando rutas');

// Middleware de debug
router.use((req, res, next) => {
    console.log(`📍 [RUTA] ${req.method} ${req.url}`);
    next();
});

// ✅ RUTA DE TEST SIMPLE - SIN CONTROLADOR
router.get('/test-simple', (req, res) => {
    console.log('🎯 [TEST SIMPLE] Ruta /test-simple EJECUTADA');
    res.json({
        success: true,
        message: 'Ruta simple funcionando',
        data: [{ id: 1, nombre: 'Test' }]
    });
});

// ✅ RUTA CON CONTROLADOR SIMPLIFICADA
router.get('/lista', (req, res) => {
    console.log('🎯 [RUTA LISTA] GET /lista - INICIANDO');
    empleadoController.obtenerEmpleados(req, res);
});

// ✅✅✅ RUTAS EXPLÍCITAS - SIN CONFLICTOS
router.get('/lista', (req, res, next) => {
    console.log('🎯 [RUTA] GET /lista - ejecutando obtenerEmpleados');
    empleadoController.obtenerEmpleados(req, res).catch(next);
});

router.post('/nuevo', (req, res, next) => {
    console.log('🎯 [RUTA] POST /nuevo - ejecutando crearEmpleado');
    empleadoController.crearEmpleado(req, res).catch(next);
});

router.get('/ver/:id', (req, res, next) => {
    console.log(`🎯 [RUTA] GET /ver/${req.params.id} - ejecutando obtenerEmpleadoPorId`);
    empleadoController.obtenerEmpleadoPorId(req, res).catch(next);
});

router.put('/editar/:id', (req, res, next) => {
    console.log(`🎯 [RUTA] PUT /editar/${req.params.id} - ejecutando actualizarEmpleado`);
    empleadoController.actualizarEmpleado(req, res).catch(next);
});

router.delete('/eliminar/:id', (req, res, next) => {
    console.log(`🎯 [RUTA] DELETE /eliminar/${req.params.id} - ejecutando eliminarEmpleado`);
    empleadoController.eliminarEmpleado(req, res).catch(next);
});

export { router as empleadosRouter };