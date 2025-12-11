import { DataTypes } from 'sequelize';
import database from '../config/database.js';

const { sequelize } = database;

const Vehiculo = sequelize.define('Vehiculo', {
  matricula: {
    type: DataTypes.STRING(15),
    primaryKey: true,
    allowNull: false,
  },
  // En el diagrama 'marca' es una FK int(20). Lo llame id_marca para ser claros en JS, 
  // pero el field en BD es 'marca' según el diagrama.
  id_marca: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'marca', // Mapea a la columna 'marca' de la BD
    references: {
      model: 'marca',
      key: 'id_marca'
    }
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
  },
  diagnosticado: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  activo: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'vehiculo',
  timestamps: false
});

export default Vehiculo;