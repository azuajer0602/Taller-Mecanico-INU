import { DataTypes } from 'sequelize';
import database from '../config/database.js';
const { sequelize } = database;
const Servicio = sequelize.define('Servicio', {
  id_servicio: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    matricula_fk: { 
    type: DataTypes.STRING,
    allowNull: false,
  },

    id_cliente: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    id_empleado_fk: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },
    id_estado: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entrega: { 
    type: DataTypes.ENUM('Entregado','No entregado'),
    allowNull: false,
  },
  fecha_entrada: { 
    type: DataTypes.DATE,
    allowNull: false,
  },
  fecha_salida: { 
    type: DataTypes.DATE,
    allowNull: false,
  },
  mano_obra: { 
    type: DataTypes.FLOAT,
    allowNull: false,
  },

}, {

  tableName: 'atributo_vehiculo', 
  freezeTableName: true, 
  timestamps: false,
  

});

export default Servicio;