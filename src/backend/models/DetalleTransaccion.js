import { DataTypes } from 'sequelize';
import database from '../config/database.js';  
const { sequelize } = database;                

const DetalleTransaccion = sequelize.define('DetalleTransaccion', {
  id_detalle: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
    autoIncrement: true
  },
  id_transaccion: {
    type: DataTypes.INTEGER(11),
    allowNull: false
  },
  debe: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  haber: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  descripcion_detalle: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  es_cuenta_por_pagar: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  es_cuenta_por_cobrar: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  // Campo agregado según la imagen
  Tipo_de_pago: {
    type: DataTypes.STRING(40),
    allowNull: false
  }
}, {
  tableName: 'detalle_transaccion',
  timestamps: false
});

export default DetalleTransaccion;