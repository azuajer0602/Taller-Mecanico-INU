import { DataTypes } from 'sequelize';
import database from '../config/database.js';
import Cliente from './Cliente.js';
import ItemFactura from './ItemFactura.js';

const Factura = database.sequelize.define('Factura', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ClienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fechaPago: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Pendiente', // Pagado, Pendiente, Anulada
    },
    metodoPago: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

export default Factura;