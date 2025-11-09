import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Empleado = sequelize.define('Empleado', {
  id_empleado: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  usuario: { 
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },

  contrasena: { 
    type: DataTypes.STRING,
    allowNull: false,
  },

    nombre_emp: { 
    type: DataTypes.STRING,
    allowNull: false, 
  },
    apellido_emp: { 
    type: DataTypes.STRING,
    allowNull: false, 
  },
    cedula_emp: { 
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },
    cargo: { 
    type: DataTypes.STRING,
    allowNull: false, 
  },
    fecha_contratacion: { 
    type: DataTypes.DATE,
    allowNull: false, 
  },
    sueldo_base: { 
    type: DataTypes.DECIMAL,
    allowNull: false, 
  },
 
}, {

  tableName: 'empleado', 
  freezeTableName: true, 

  timestamps: false,
  

});

Empleado.prototype.comparePassword = function(candidatePassword) {
  
  return candidatePassword === this.contrasena; 
};

export default Empleado;