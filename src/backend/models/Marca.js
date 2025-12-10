import { DataTypes } from 'sequelize';
import database from '../config/database.js';
const { sequelize } = database;
const Marca = sequelize.define('Marca', {
  id_marca: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    nombre_marca: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {

  tableName: 'marca', 
  freezeTableName: true, 
  timestamps: false,
  

});

export default Marca;