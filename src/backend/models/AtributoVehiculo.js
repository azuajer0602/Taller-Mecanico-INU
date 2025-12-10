import { DataTypes } from 'sequelize';
import database from '../config/database.js';
const { sequelize } = database;
const AtributoVehiculo = sequelize.define('AtributoVehiculo', {
  id_atributo_vehiculo: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    matricula: { 
    type: DataTypes.STRING,
    allowNull: false,
  },

    id_atributo: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },
    id_estado_atributo: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {

  tableName: 'atributo_vehiculo', 
  freezeTableName: true, 
  timestamps: false,
  

});

export default AtributoVehiculo;