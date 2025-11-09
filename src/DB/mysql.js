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
    field: 'id_cliente' // Mapear explícitamente 
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: false,
  //  unique: {
  //    msg: 'La cédula ya está registrada'
  //  },
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
    notEmpty: { msg: 'El nombre es requerido' },
    len: { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres' },
    isAlphaSpace(value) {
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/u.test(value)) {
        throw new Error('El nombre solo puede contener letras, espacios, guiones y apóstrofes');
      }
    }
  }
},
apellido: {
  type: DataTypes.STRING(100),
  allowNull: false,
  validate: {
    notEmpty: { msg: 'El apellido es requerido' },
    isAlphaSpace(value) {
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/u.test(value)) {
        throw new Error('El apellido solo puede contener letras, espacios, guiones y apóstrofes');
      }
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
      },
      isNumericOrEmpty(value) {
      if (value) {
        if (!/^\d+$/.test(value)) {
          throw new Error('El teléfono solo puede contener dígitos');
        }
        if (value.length < 8 || value.length > 20) {
          throw new Error('El teléfono debe tener entre 8 y 20 caracteres');
        }
      }
    }

    }
  }
}, {
  tableName: 'cliente', // Nombre exacto de la tabla
  timestamps: false, 
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