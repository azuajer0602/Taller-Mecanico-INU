const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cedula: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  direccion: DataTypes.STRING,
  telefono: DataTypes.STRING
}, {
  tableName: 'clientes',
  timestamps: true
});

module.exports = Cliente;