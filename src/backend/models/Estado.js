import { DataTypes } from 'sequelize';
import database from '../config/database.js';
const { sequelize } = database;
const Estado = sequelize.define('Estado', {
  id_estado: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    nombre_estado: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {

  tableName: 'estado', 
  freezeTableName: true, 
  timestamps: false,
  

});

export default Estado;