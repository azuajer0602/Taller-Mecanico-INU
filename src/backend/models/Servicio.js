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
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  id_empleado_fk: {
    type: DataTypes.INTEGER,
    allowNull: true, // Se llena luego
  },
  id_estado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1 // Asumimos que 1 es "Pendiente" o "En Revisión"
  },
  id_falla_reportada: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entrega: {
    type: DataTypes.ENUM('Entregado', 'No entregado'),
    defaultValue: 'No entregado'
  },
  fecha_entrada: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  fecha_salida: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  mano_obra: {
    type: DataTypes.FLOAT,
    allowNull: true
  }
}, {
  tableName: 'servicio',
  timestamps: false
});

export default Servicio;