import { DataTypes } from 'sequelize';
import database from '../config/database.js';

const { sequelize } = database;

const Falla = sequelize.define('Falla', {
  id_falla: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_falla: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'fallas',
  timestamps: false
});

export default Falla;