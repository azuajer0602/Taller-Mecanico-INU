import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const Empleado = sequelize.define('Empleado', {
    id_empleado: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'id_empleado', // ← ESPECIFICAR el nombre de columna exacto
        validate: {
            isInt: {
                msg: 'El ID debe ser un número entero'
            }
        }
    },
    usuario: {
        type: DataTypes.STRING(30), // ← AJUSTADO a 30 caracteres
        allowNull: false,
        unique: {
            args: true,
            msg: 'El usuario ya está en uso'
        },
        validate: {
            notEmpty: {
                msg: 'El usuario no puede estar vacío'
            },
            len: {
                args: [3, 30], // ← AJUSTADO a 30 caracteres
                msg: 'El usuario debe tener entre 3 y 30 caracteres'
            }
        }
    },
    contrasena: {
        type: DataTypes.STRING(45), // ← AJUSTADO a 45 caracteres
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La contraseña no puede estar vacía'
            },
            len: {
                args: [4, 45], // ← AJUSTADO a 45 caracteres
                msg: 'La contraseña debe tener entre 4 y 45 caracteres'
            }
        }
    },
    nombre_emp: {
        type: DataTypes.STRING(45), // ← AJUSTADO a 45 caracteres
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre no puede estar vacío'
            },
            len: {
                args: [2, 45], // ← AJUSTADO a 45 caracteres
                msg: 'El nombre debe tener entre 2 y 45 caracteres'
            },
            is: {
                args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                msg: 'El nombre solo puede contener letras y espacios'
            }
        }
    },
    apellido_emp: {
        type: DataTypes.STRING(45), // ← AJUSTADO a 45 caracteres
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El apellido no puede estar vacío'
            },
            len: {
                args: [2, 45], // ← AJUSTADO a 45 caracteres
                msg: 'El apellido debe tener entre 2 y 45 caracteres'
            },
            is: {
                args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                msg: 'El apellido solo puede contener letras y espacios'
            }
        }
    },
    cedula_emp: {
        type: DataTypes.STRING(9), // ← AJUSTADO a 9 caracteres
        allowNull: false,
        unique: {
            args: true,
            msg: 'La cédula ya está registrada'
        },
        validate: {
            notEmpty: {
                msg: 'La cédula no puede estar vacía'
            },
            len: {
                args: [5, 9], // ← AJUSTADO a 9 caracteres
                msg: 'La cédula debe tener entre 5 y 9 caracteres'
            }
        }
    },
    cargo: {
        type: DataTypes.STRING(45), // ← AJUSTADO a 45 caracteres
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El cargo no puede estar vacío'
            },
            len: {
                args: [2, 45], // ← AJUSTADO a 45 caracteres
                msg: 'El cargo debe tener entre 2 y 45 caracteres'
            }
        }
    },
    fecha_contratacion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'La fecha de contratación debe ser una fecha válida'
            },
            notEmpty: {
                msg: 'La fecha de contratación no puede estar vacía'
            },
            isBefore: {
                args: new Date().toISOString().split('T')[0],
                msg: 'La fecha de contratación no puede ser futura'
            }
        }
    },
    sueldo_base: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: {
                msg: 'El sueldo base debe ser un número decimal válido'
            },
            min: {
                args: [0],
                msg: 'El sueldo base no puede ser negativo'
            },
            max: {
                args: [99999999.99],
                msg: 'El sueldo base es demasiado alto'
            }
        }
    }
}, {
    tableName: 'empleado',
    freezeTableName: true,
    timestamps: false,
    // ← AGREGAR esta configuración para que Sequelize use id_empleado correctamente
    underscored: true,
    hooks: {
        beforeValidate: (empleado) => {
            if (empleado.fecha_contratacion) {
                const fechaContratacion = new Date(empleado.fecha_contratacion);
                const hoy = new Date();
                if (fechaContratacion > hoy) {
                    throw new Error('La fecha de contratación no puede ser futura');
                }
            }
        }
    }
});

export default Empleado;