import { DataTypes } from 'sequelize';
import database from '../config/database.js';
import Factura from './Factura.js';

const ItemFactura = database.sequelize.define('ItemFactura', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    FacturaId: { // Campo para la clave foránea
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
});

export default ItemFactura;