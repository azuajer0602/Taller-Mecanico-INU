import { DataTypes } from 'sequelize';
import database from '../config/database.js'; // ← Cambio aquí

const { sequelize } = database; // ← Cambio aquí

const Vehiculo = sequelize.define('Vehiculo', {
  matricula: {
    type: DataTypes.STRING(15),
    primaryKey: true,
    allowNull: false,
  },
  marca: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  modelo: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  afio: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_cliente',
    references: {
      model: 'cliente',
      key: 'id_cliente'
    }
  }
}, {
  tableName: 'vehiculo',
  timestamps: false
});

export default Vehiculo;