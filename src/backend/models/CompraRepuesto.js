import { DataTypes } from 'sequelize';
import database from '../config/database.js';
const { sequelize } = database;
const CompraRepuesto = sequelize.define('CompraRepuesto', {
  id_compra_repuesto: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

    precio_unitario_compra: { 
    type: DataTypes.DECIMAL,
    allowNull: false, 
  },

    fecha_compra: { 
    type: DataTypes.DATE,
    allowNull: false,
  },

    cantidad_comprada: { 
    type: DataTypes.INTEGER,
    allowNull: false, 
  },
    id_proveedor: { 
    type: DataTypes.INTEGER,
    allowNull: false, 
  },
    id_repuesto: { 
    type: DataTypes.INTEGER,
    allowNull: false, 
  },
}, {

  tableName: 'compra_repuesto', 
  freezeTableName: true, 
  timestamps: false,
  

});

export default CompraRepuesto;