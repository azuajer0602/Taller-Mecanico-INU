import { Sequelize, DataTypes } from 'sequelize';
import config from '../backend/config.js';

// Conectar a la base de datos
async function conectarDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB conectada con Sequelize');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    setTimeout(conectarDB, 2000);
  }
}

conectarDB();

const models = {
  sequelize
};
