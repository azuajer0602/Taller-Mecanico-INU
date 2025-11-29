import { DataTypes } from 'sequelize';
import database from '../config/database.js';  
const { sequelize } = database;                


const TipoTransaccion = sequelize.define('TipoTransaccion', {
  id_tipo_transaccion_pk: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
    autoIncrement: true
  },
  nombre_tipo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  codigo_tipo_transaccion: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  tipo_cuenta: {
    type: DataTypes.ENUM('ACTIVO', 'PASIVO', 'CAPITAL', 'INGRESO', 'GASTO'),
    allowNull: false
  }
}, {
  tableName: 'tipo_transaccion',
  timestamps: false
});

export default TipoTransaccion;