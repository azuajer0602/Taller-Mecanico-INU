import { Sequelize, DataTypes } from 'sequelize';
import config from '../backend/config.js';

const sequelize = new Sequelize(
  config.mysql.database,
  config.mysql.user,
  config.mysql.password,
  {
    host: config.mysql.host,
    dialect: 'mysql',
    logging: false
  }
);

// Modelo Cliente ajustado a tu estructura real
const Cliente = sequelize.define('Cliente', {
  id_cliente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_cliente' // Mapear explícitamente si es necesario
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: {
      msg: 'La cédula ya está registrada'
    },
    validate: {
      notEmpty: {
        msg: 'La cédula es requerida'
      }
    }
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El apellido es requerido'
      }
    }
  },
  correo: { // Nota: en tu tabla es 'correo', no 'email'
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'El correo ya está registrado'
    },
    validate: {
      isEmail: {
        msg: 'Debe ser un correo electrónico válido'
      },
      notEmpty: {
        msg: 'El correo es requerido'
      }
    }
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [8, 20],
        msg: 'El teléfono debe tener entre 8 y 20 caracteres'
      }
    }
  }
}, {
  tableName: 'cliente', // Nombre exacto de tu tabla
  timestamps: false, // Si no tienes campos de timestamp
  // Si tienes campos de timestamp con otros nombres:
  // timestamps: true,
  // createdAt: 'fecha_creacion',
  // updatedAt: 'fecha_actualizacion'
});

// Conectar a la base de datos
async function conectarDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB conectada con Sequelize');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    setTimeout(conectarDB, 2000);
  }
}

conectarDB();

const models = {
  Cliente,
  sequelize
};

export default models;