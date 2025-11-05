import { Sequelize } from 'sequelize';

// Detalles de tu conexión MySQL
// **IMPORTANTE**: Reemplaza estos valores con tus credenciales reales
const DB_NAME = 'mecanosoft'; // Ejemplo: 'mecanosoft_db'
const DB_USER = 'root';   // Ejemplo: 'root'
const DB_PASSWORD = '1234'; // Ejemplo: 'password123'
const DB_HOST = 'localhost';        // Por defecto
const DB_DIALECT = 'mysql';

// Instancia de Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: false, // Desactiva los logs de SQL en consola
  // Puedes añadir opciones adicionales de MySQL si las necesitas
  // define: {
  //   timestamps: true // Para tener createdAt y updatedAt por defecto
  // }
});

export { sequelize };