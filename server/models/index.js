const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js'); 
const Cliente = require('./Cliente');

// --- Modelo Factura ---
const Factura = sequelize.define('Factura', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fechaPago: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('Pagado', 'Pendiente', 'Anulada'),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  metodoPago: {
    type: DataTypes.STRING,
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'facturas',
  timestamps: true
});

// --- Modelo ItemFactura ---
const ItemFactura = sequelize.define('ItemFactura', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'items_factura',
  timestamps: false 
});

// --- Definición de Relaciones ---
Cliente.hasMany(Factura, { foreignKey: 'clienteId' });
Factura.belongsTo(Cliente, { foreignKey: 'clienteId' });

Factura.hasMany(ItemFactura, { foreignKey: 'facturaId', onDelete: 'CASCADE' });
ItemFactura.belongsTo(Factura, { foreignKey: 'facturaId' });

module.exports = { sequelize, Cliente, Factura, ItemFactura };