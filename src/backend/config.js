import { Sequelize } from 'sequelize';

const DB_NAME = 'mecanosoft'; 
const DB_USER = 'root';
const DB_PASSWORD = ''; 
const DB_HOST = 'localhost';  
const DB_DIALECT = 'mysql';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: console.log, // ← ACTIVAR logging temporalmente
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export { sequelize };