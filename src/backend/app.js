import express from 'express';
import { empleadosRouter } from './modelos/empleados/rutas.js';
import cors from 'cors';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', empleadosRouter);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API del Taller Mecánico funcionando',
        timestamp: new Date().toISOString()
    });
});

// ✅ CORREGIDO: Manejo de rutas no encontradas (sin *)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
    console.error('Error global:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Rutas de empleados disponibles en http://localhost:${PORT}/api/empleados`);
});