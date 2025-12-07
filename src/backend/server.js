import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Importación de Rutas
import authRoutes from './routes/auth.js';
import clientesRoutes from './routes/rutas.js'; // Renombrado para claridad
import vehiculoRoutes from './routes/vehiculoRoutes.js';
import repuestosRoutes from './routes/repuestosRoutes.js'
import transaccionRoutes from './routes/transaccionesroutes.js';
import tipoTransaccionRoutes from './routes/tipoTransaccionRoutes.js';
import diagnosticoRoutes from './routes/diagnosticoRoutes.js';
import facturaRoutes from './routes/facturaRoutes.js';
import proveedoresRoutes from './routes/proveedoresRoutes.js';
import Compras from './routes/compraRepuestosRoutes.js' // ¡NUEVA RUTA PARA FACTURAS!

// Configuración de Base de Datos
import database from './config/database.js';
import setupAssociations from './models/AssociationsTransacciones.js';
import setupAsso from './models/associations.js';
import error from '../red/errors.js';

const { sequelize } = database;

// ==================== INICIALIZACIÓN ====================
const app = express();
const PORT = 3000;

// ==================== MIDDLEWARES ====================
// Habilita CORS para permitir que tu app Vue se conecte
app.use(cors());
// Para entender JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Para ver logs de las peticiones en la consola (muy útil para depurar)
app.use(morgan('dev'));

// ==================== RUTAS DE LA API ====================
app.use('/api/auth', authRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/repuestos', repuestosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/compras', Compras)
app.use('/api/tipos-transaccion', tipoTransaccionRoutes);
app.use('/api/diagnosticos', diagnosticoRoutes);
app.use('/api/transacciones', transaccionRoutes);
app.use('/api/facturas', facturaRoutes); // ¡NUEVA RUTA PARA FACTURAS!

// ==================== MANEJO DE ERRORES CENTRALIZADO ====================
app.use(error);

// ==================== INICIO DEL SERVIDOR ====================
async function startServer() {
  try {
    // 1. Autenticar conexión con la BD
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // 2. Configurar asociaciones
    console.log('🔄 Configurando asociaciones de modelos...');
    setupAssociations();
    console.log('✅ Asociaciones configuradas.');
    
    // 3. Sincronizar la base de datos
    console.log('🔄 Sincronizando modelos con la base de datos...');
    // Usar { alter: true } en desarrollo para ajustar tablas sin borrar datos.
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados con la base de datos.');

    // 4. Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1); // Detiene la aplicación si no se puede conectar a la BD
  }
}

startServer();

export default app;
