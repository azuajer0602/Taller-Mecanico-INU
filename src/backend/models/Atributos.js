import { DataTypes } from 'sequelize';
import database from '../config/database.js';
const { sequelize } = database;
const Atributos = sequelize.define('Atributos', {
  id_atributo: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    nombre: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {

  tableName: 'atributos', 
  freezeTableName: true, 
  timestamps: false,
  

});

export default Atributos;