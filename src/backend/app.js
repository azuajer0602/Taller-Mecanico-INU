import express from 'express';
import cors from 'cors';

const app = express();

// Middlewares
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`📍 [APP] ${req.method} ${req.originalUrl}`);
    next();
});

// ✅ RUTA PRINCIPAL DE EMPLEADOS - DIRECTA Y SIMPLE
app.get('/api/empleados/lista', async (req, res) => {
    try {
        console.log('🎯 [APP] Ruta /api/empleados/lista ejecutada');
        
        // Importar y ejecutar el controlador directamente
        const { default: empleadoController } = await import('./modelos/empleados/controlador.js');
        await empleadoController.obtenerEmpleados(req, res);
        
    } catch (error) {
        console.error('❌ [APP] Error en ruta /lista:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ✅ RUTA PARA OBTENER UN EMPLEADO POR ID
app.get('/api/empleados/ver/:id', async (req, res) => {
    try {
        console.log(`🎯 [APP] Ruta /api/empleados/ver/${req.params.id} ejecutada`);
        const { default: empleadoController } = await import('./modelos/empleados/controlador.js');
        await empleadoController.obtenerEmpleadoPorId(req, res);
    } catch (error) {
        console.error('❌ [APP] Error en ruta /ver/:id:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ✅ RUTA PARA CREAR EMPLEADO
app.post('/api/empleados/nuevo', async (req, res) => {
    try {
        console.log('🎯 [APP] Ruta /api/empleados/nuevo ejecutada');
        const { default: empleadoController } = await import('./modelos/empleados/controlador.js');
        await empleadoController.crearEmpleado(req, res);
    } catch (error) {
        console.error('❌ [APP] Error en ruta /nuevo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ✅ RUTA PARA ACTUALIZAR EMPLEADO
app.put('/api/empleados/editar/:id', async (req, res) => {
    try {
        console.log(`🎯 [APP] Ruta /api/empleados/editar/${req.params.id} ejecutada`);
        const { default: empleadoController } = await import('./modelos/empleados/controlador.js');
        await empleadoController.actualizarEmpleado(req, res);
    } catch (error) {
        console.error('❌ [APP] Error en ruta /editar/:id:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ✅ RUTA PARA ELIMINAR EMPLEADO
app.delete('/api/empleados/eliminar/:id', async (req, res) => {
    try {
        console.log(`🎯 [APP] Ruta /api/empleados/eliminar/${req.params.id} ejecutada`);
        const { default: empleadoController } = await import('./modelos/empleados/controlador.js');
        await empleadoController.eliminarEmpleado(req, res);
    } catch (error) {
        console.error('❌ [APP] Error en ruta /eliminar/:id:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ✅ RUTA DE PRUEBA SUPER SIMPLE
app.get('/api/test-simple', (req, res) => {
    console.log('✅ [TEST] Ruta /api/test-simple funcionando');
    res.json({
        success: true,
        message: '✅ Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// ✅ RUTA DE HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        message: 'Backend funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// ✅ RUTA RAÍZ
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API del Taller Mecánico funcionando ✅',
        timestamp: new Date().toISOString(),
        endpoints: {
            empleados_lista: '/api/empleados/lista',
            empleados_ver: '/api/empleados/ver/:id',
            empleados_nuevo: '/api/empleados/nuevo',
            empleados_editar: '/api/empleados/editar/:id',
            empleados_eliminar: '/api/empleados/eliminar/:id',
            test: '/api/test-simple',
            health: '/api/health'
        }
    });
});

// ✅ MANEJO DE RUTAS NO ENCONTRADAS
app.use((req, res) => {
    console.log(`❌ [APP] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

// ✅ MIDDLEWARE GLOBAL DE MANEJO DE ERRORES
app.use((error, req, res, next) => {
    console.error('❌ [APP] Error global:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Rutas de empleados disponibles:`);
    console.log(`   • GET    /api/empleados/lista`);
    console.log(`   • GET    /api/empleados/ver/:id`);
    console.log(`   • POST   /api/empleados/nuevo`);
    console.log(`   • PUT    /api/empleados/editar/:id`);
    console.log(`   • DELETE /api/empleados/eliminar/:id`);
    console.log(`   • GET    /api/test-simple`);
    console.log(`   • GET    /api/health`);
    console.log(`🌐 Frontend Vue: http://localhost:5173`);
    console.log(`🔧 CORS configurado para: http://localhost:5173`);
    console.log(`✅ BACKEND COMPLETAMENTE OPERATIVO`);
});