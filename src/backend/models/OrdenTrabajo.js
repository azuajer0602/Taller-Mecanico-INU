import { DataTypes } from 'sequelize';
import database from '../config/database.js';
const { sequelize } = database;
const Ordentrabajo = sequelize.define('Ordentrabajo', {
  id_order: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    fecha_inicio: { 
    type: DataTypes.DATE,
    allowNull: false,
  },

    fecha_estimada: { 
    type: DataTypes.DATE,
    allowNull: false,
  },
    fecha_fin: { 
    type: DataTypes.DATE,
    allowNull: false,
  },
    estado: { 
    type: DataTypes.STRING,
    allowNull: false, 
  },
    num_diagnostico: { 
    type: DataTypes.INTEGER,
    allowNull: false, 
  },
}, {

  tableName: 'orden_de_trabajo', 
  freezeTableName: true, 
  timestamps: false,
  

});

export default Ordentrabajo;