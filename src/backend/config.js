import { Sequelize } from 'sequelize';

const DB_NAME = 'mecanosoft'; 
const DB_USER = 'root';
const DB_PASSWORD = ''; 
const DB_HOST = 'localhost';  
const DB_DIALECT = 'mysql';


const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: false, 
});

export { sequelize };