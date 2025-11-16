import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import database from './config/database.js';
const { sequelize } = database;
import clientes from './routes/rutas.js';
import vehiculoRoutes from './routes/vehiculoRoutes.js';
import diagnosticoRoutes from './routes/diagnosticoRoutes.js';
import morgan from 'morgan';
import error from '../red/errors.js';

// ==================== INICIALIZACIÓN ====================
const app = express(); // ← PRIMERO declarar app
const PORT = 3000;

// ==================== MIDDLEWARES ====================
app.use(cors()); // ← LUEGO usar app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ==================== RUTAS ====================
app.use('/api/clientes', clientes);
app.use('/api/auth', authRoutes);
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
app.use(error);

// ==================== INICIO DEL SERVIDOR ====================
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    await sequelize.sync();
    console.log('Modelos sincronizados.');

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor o conectar a la base de datos:', error);
  }
}

startServer();

export default app;