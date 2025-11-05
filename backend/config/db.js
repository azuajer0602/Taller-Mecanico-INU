const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mecanosoft',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Función de conexión que usa el backend
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a la base de datos MySQL - MecanoSoft');
    connection.release();
    return pool;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    process.exit(1);
  }
};

// Mantener tu función original también
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a MECANOSOFT');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error BD:', error.message);
    return false;
  }
};

// Exportar ambas funciones
module.exports = { pool, testConnection, connectDB };