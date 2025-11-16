import { DataTypes } from 'sequelize';
import database from '../config/database.js';
const { sequelize } = database;

const Diagnostico = sequelize.define('Diagnostico', {
  num_diagnostico: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'num_diagnostico'
  },
  id_vehiculo: {
    type: DataTypes.STRING(15),
    allowNull: false,
    field: 'id_vehiculo'
  },
  fecha_ingreso: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_ingreso'
  },
  descrip_falla: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'descrip_falla'
  }
}, {
  tableName: 'diagnostico',
  timestamps: false
});

export { Diagnostico };