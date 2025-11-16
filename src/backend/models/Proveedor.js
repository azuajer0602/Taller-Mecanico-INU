import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Proveedor = sequelize.define('Proveedor', {
  id_proveedor: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
  },

    nombre_fiscal: { 
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },

    rif_juridico: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    telefono_proveedor: { 
    type: DataTypes.STRING,
    allowNull: false, 
  },
    direccion_proveedor: { 
    type: DataTypes.STRING,
    allowNull: false, 
  },
}, {

  tableName: 'proveedor', 
  freezeTableName: true, 

  timestamps: false,
  

});

export default Proveedor;