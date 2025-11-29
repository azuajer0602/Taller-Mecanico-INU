import { DataTypes } from 'sequelize';
import database from '../config/database.js';  
const { sequelize } = database;                


const Transaccion = sequelize.define('Transaccion', {
  id_transaccion: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
    autoIncrement: true
  },
  id_tipo_transaccion_fk: {
    type: DataTypes.INTEGER(45),
    allowNull: false
  },
  fecha_asiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'transacciones',
  timestamps: false
});

export default Transaccion;