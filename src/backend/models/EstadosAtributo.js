import { DataTypes } from 'sequelize';
import database from '../config/database.js';
const { sequelize } = database;
const EstadosAtributo = sequelize.define('EstadosAtributo', {
  id_estado_atributo_fk: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    nombre_atributo: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {

  tableName: 'estados_atributo', 
  freezeTableName: true, 
  timestamps: false,
  

});

export default EstadosAtributo;