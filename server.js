import express from 'express';
import authRoutes from './routes/auth.js';
import { sequelize } from './config/database.js';

const app = express();
const PORT = 3000; 

app.use(express.json());

app.use('/api/auth', authRoutes);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    await sequelize.sync();
    console.log(' Modelos sincronizados.');


    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor o conectar a la base de datos:', error);
  }
}

startServer();