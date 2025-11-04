import { Sequelize } from 'sequelize';
import config from '../backend/config.js';

// Configurar Sequelize
const sequelize = new Sequelize(
  config.mysql.database,
  config.mysql.user,
  config.mysql.password,
  {
    host: config.mysql.host,
    dialect: 'mysql',
    logging: false
  }
);

// Conectar a la base de datos
async function conMysql() {
  try {
    await sequelize.authenticate();
    console.log('DB conectada con Sequelize');
  } catch (error) {
    console.log('Error de conexión:', error);
    setTimeout(conMysql, 200);
  }
}

conMysql();

// Funciones para operaciones CRUD
function traertodos(tabla) {
  return new Promise(async (resolve, reject) => {
    try {
      const [resultados] = await sequelize.query(`SELECT * FROM ${tabla}`);
      resolve(resultados);
    } catch (error) {
      reject(error);
    }
  });
}

function traeruno(tabla, id) {
  return new Promise(async (resolve, reject) => {
    try {
      const [resultados] = await sequelize.query(
        `SELECT * FROM ${tabla} WHERE id_cliente = ?`,
        { replacements: [id] }
      );
      resolve(resultados);
    } catch (error) {
      reject(error);
    }
  });
}

function insertar(tabla, data) {
  return new Promise(async (resolve, reject) => {
    try {
      const campos = Object.keys(data).join(', ');
      const valores = Object.values(data);
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      
      const [resultado] = await sequelize.query(
        `INSERT INTO ${tabla} (${campos}) VALUES (${placeholders})`,
        { replacements: valores }
      );
      resolve(resultado);
    } catch (error) {
      reject(error);
    }
  });
}

function actualizar(tabla, data) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = data.id_cliente;
      delete data.id_cliente;

      const campos = Object.keys(data).map(campo => `${campo} = ?`).join(', ');
      const valores = Object.values(data);
      valores.push(id); // Para el WHERE

      const [resultado] = await sequelize.query(
        `UPDATE ${tabla} SET ${campos} WHERE id_cliente = ?`,
        { replacements: valores }
      );
      resolve(resultado);
    } catch (error) {
      reject(error);
    }
  });
}

function agregar(tabla, datos) {
  if (datos && datos.id_cliente == 0) {
    return insertar(tabla, datos);
  } else {
    return actualizar(tabla, datos);
  }
}

function eliminar(tabla, data) {
  return new Promise(async (resolve, reject) => {
    try {
      const [resultado] = await sequelize.query(
        `DELETE FROM ${tabla} WHERE id_cliente = ?`,
        { replacements: [data.id_cliente] }
      );
      resolve(resultado);
    } catch (error) {
      reject(error);
    }
  });
}

export default {
  traertodos,
  traeruno,
  agregar,
  eliminar
};