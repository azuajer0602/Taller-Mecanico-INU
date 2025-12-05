import { DataTypes } from 'sequelize';
import database from '../config/database.js';
const { sequelize } = database;
const Repuesto = sequelize.define('Repuesto', {
  id_repuesto: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
  },

    nombre_repuesto: { 
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },

    desc_repuesto: { 
    type: DataTypes.STRING,
    allowNull: false,
  },

    precio_unitario: { 
    type: DataTypes.DECIMAL,
    allowNull: false, 
  },
    stock_inventario: { 
    type: DataTypes.INTEGER,
    allowNull: false, 
  },
}, {

  tableName: 'repuesto', 
  freezeTableName: true, 
  timestamps: false,
  

});

export default Repuesto;