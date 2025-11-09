import express from 'express';
import cors from 'cors';
import { connectDB } from './config/bd.js';
import vehiculoRoutes from './routes/vehiculoRoutes.js';
import diagnosticoRoutes from './routes/diagnosticoRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== CONEXIÓN BASE DE DATOS ====================
connectDB()
  .then(() => {
    console.log('✅ Base de datos conectada exitosamente');
  })
  .catch(error => {
    console.error('❌ Error crítico con la base de datos:', error);
    process.exit(1);
  });

// ==================== RUTAS DE LA API ====================
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/diagnosticos', diagnosticoRoutes);

// ==================== RUTAS GENERALES ====================

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 API MecanoSoft funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'MySQL + Sequelize'
  });
});

// Información de la API
app.get('/api/info', (req, res) => {
  res.json({
    name: 'MecanoSoft API',
    version: '1.0.0',
    description: 'Sistema administrativo para taller mecánico',
    technologies: ['Node.js', 'Express', 'MySQL', 'Sequelize'],
    endpoints: {
      vehiculos: {
        'GET /api/vehiculos': 'Obtener todos los vehículos',
        'GET /api/vehiculos/diagnostico': 'Vehículos para diagnóstico',
        'GET /api/vehiculos/:matricula': 'Obtener vehículo por matrícula',
        'POST /api/vehiculos': 'Crear nuevo vehículo',
        'PUT /api/vehiculos/:matricula': 'Actualizar vehículo',
        'DELETE /api/vehiculos/:matricula': 'Eliminar vehículo'
      },
      diagnosticos: {
        'GET /api/diagnosticos': 'Obtener todos los diagnósticos',
        'GET /api/diagnosticos/vehiculo/:vehiculoId': 'Diagnósticos por vehículo',
        'GET /api/diagnosticos/:id': 'Obtener diagnóstico por ID',
        'POST /api/diagnosticos': 'Crear nuevo diagnóstico',
        'PUT /api/diagnosticos/:id': 'Actualizar diagnóstico',
        'DELETE /api/diagnosticos/:id': 'Eliminar diagnóstico'
      }
    }
  });
});

// ==================== MANEJO DE ERRORES ====================

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada en el servidor`
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('💥 Error global del servidor:', error);
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.message,
      stack: error.stack 
    })
  });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('🚗 MECANOSOFT - SISTEMA ADMINISTRATIVO PARA TALLER MECÁNICO');
  console.log('='.repeat(70));
  console.log(`📡 Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Info API: http://localhost:${PORT}/api/info`);
  console.log('='.repeat(70));
  console.log('🗃️  BASE DE DATOS: MySQL + Sequelize ORM');
  console.log('🔗 ENDPOINTS CONFIGURADOS:');
  console.log('   🚗 VEHÍCULOS:');
  console.log('      GET    /api/vehiculos                 - Listar todos');
  console.log('      GET    /api/vehiculos/diagnostico     - Para diagnóstico');
  console.log('      GET    /api/vehiculos/:matricula      - Obtener por matrícula');
  console.log('      POST   /api/vehiculos                 - Crear nuevo');
  console.log('      PUT    /api/vehiculos/:matricula      - Actualizar');
  console.log('      DELETE /api/vehiculos/:matricula      - Eliminar');
  console.log('   🔧 DIAGNÓSTICOS:');
  console.log('      GET    /api/diagnosticos              - Listar todos');
  console.log('      GET    /api/diagnosticos/vehiculo/:id - Por vehículo');
  console.log('      GET    /api/diagnosticos/:id          - Obtener por ID');
  console.log('      POST   /api/diagnosticos              - Crear nuevo');
  console.log('      PUT    /api/diagnosticos/:id          - Actualizar');
  console.log('      DELETE /api/diagnosticos/:id          - Eliminar');
  console.log('='.repeat(70));
  console.log('✅ Backend modular con persistencia en base de datos MySQL');
  console.log('✅ APIs RESTful implementadas con Node.js y Express');
  console.log('✅ CRUD completo para módulos Vehículos y Diagnósticos');
  console.log('='.repeat(70));
});

export default app;