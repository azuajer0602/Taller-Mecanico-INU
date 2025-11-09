import { DataTypes } from 'sequelize';
import { sequelize } from '../config/bd.js';

const Vehiculo = sequelize.define('Vehiculo', {
  matricula: {
    type: DataTypes.STRING(15),
    primaryKey: true,
    allowNull: false,
    field: 'matricula'
  },
  marca: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'marca'
  },
  modelo: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'modelo'
  },
  afio: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'afio'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'color'
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_cliente'
  }
}, {
  tableName: 'vehiculo',
  timestamps: false
});

export { Vehiculo };