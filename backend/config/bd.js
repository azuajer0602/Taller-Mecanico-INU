import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import mysql2 from 'mysql2/promise.js';

dotenv.config();

// Mostrar configuración cargada
console.log('🔍 CONFIGURACIÓN CARGADA DESDE .env:');
console.log('   - DB_HOST:', process.env.DB_HOST || 'localhost (valor por defecto)');
console.log('   - DB_NAME:', process.env.DB_NAME || 'mecanosoft (valor por defecto)');
console.log('   - DB_USER:', process.env.DB_USER || 'root (valor por defecto)');
console.log('   - DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : '(vacío)');
console.log('   - DB_PORT:', process.env.DB_PORT || '3306 (valor por defecto)');

// Configuración de Sequelize usando tu conexión existente
const sequelize = new Sequelize(
  process.env.DB_NAME || 'mecanosoft',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false, // Desactiva los logs de SQL en consola
    define: {
      timestamps: true, // Agrega createdAt y updatedAt automáticamente
      freezeTableName: true // Evita que Sequelize pluralice los nombres de tablas
    }
  }
);

// Función de conexión mejorada CON DEBUG DETALLADO
const connectDB = async () => {
  try {
    console.log('\n🔌 INTENTANDO CONECTAR A LA BASE DE DATOS...');
    
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos MySQL con Sequelize - MecanoSoft');
    
    // Sincronizar modelos con la base de datos (sin borrar datos)
    console.log('🔄 Sincronizando modelos con la base de datos...');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Modelos sincronizados con la base de datos');
    
    return sequelize;
  } catch (error) {
    console.error('\n❌ ERROR DETALLADO CONECTANDO A LA BASE DE DATOS:');
    console.error('🔍 Mensaje:', error.message);
    console.error('🔍 Código:', error.code);
    console.error('🔍 Número de error:', error.errno);
    console.error('🔍 SQL State:', error.sqlState);
    
    console.log('\n📋 DIAGNÓSTICO:');
    console.log('   1. ¿MySQL está instalado y ejecutándose?');
    console.log('   2. ¿La base de datos "' + (process.env.DB_NAME || 'mecanosoft') + '" existe?');
    console.log('   3. ¿El usuario y contraseña son correctos?');
    console.log('   4. ¿El puerto ' + (process.env.DB_PORT || 3306) + ' está disponible?');
    
    process.exit(1);
  }
};

// Mantener tu función testConnection existente si la necesitas
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión con Sequelize verificada - MECANOSOFT');
    return true;
  } catch (error) {
    console.error('❌ Error en conexión Sequelize:', error.message);
    return false;
  }
};

// Crear el pool de conexiones
const pool = mysql2.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mecanosoft',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exportar tanto Sequelize como las funciones
export { 
  sequelize, 
  connectDB, 
  testConnection,
  pool
};