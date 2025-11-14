import express from 'express';
import empleadoController from './controlador.js';

const router = express.Router();

const validarDatosEmpleado = (req, res, next) => {
    const { sueldo_base, fecha_contratacion } = req.body;
    
    if (sueldo_base && isNaN(parseFloat(sueldo_base))) {
        return res.status(400).json({
            success: false,
            message: 'El sueldo base debe ser un número válido'
        });
    }
    
    if (fecha_contratacion && isNaN(Date.parse(fecha_contratacion))) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de contratación debe tener un formato válido'
        });
    }
    
    next();
};

// Rutas para empleados
router.post('/empleados', validarDatosEmpleado, empleadoController.crearEmpleado);
router.get('/empleados', empleadoController.obtenerEmpleados);
router.get('/empleados/:id', empleadoController.obtenerEmpleadoPorId);
router.put('/empleados/:id', validarDatosEmpleado, empleadoController.actualizarEmpleado);
router.delete('/empleados/:id', empleadoController.eliminarEmpleado);

// ✅ CORREGIDO: Manejo de rutas no encontradas para empleados
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta de empleado no encontrada: ${req.method} ${req.originalUrl}`
    });
});

// Middleware de manejo de errores para estas rutas
router.use((error, req, res, next) => {
    console.error('Error en rutas de empleados:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor en el módulo de empleados',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
});

export { router as empleadosRouter };