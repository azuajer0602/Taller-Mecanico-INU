import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js'; // Ajusta la ruta

const Empleado = sequelize.define('Empleado', {
    id_empleado: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        validate: {
            isInt: {
                msg: 'El ID debe ser un número entero'
            }
        }
    },
    usuario: {
        type: DataTypes.STRING(50),
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
                args: [3, 50],
                msg: 'El usuario debe tener entre 3 y 50 caracteres'
            }
        }
    },
    contrasena: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La contraseña no puede estar vacía'
            },
            len: {
                args: [4, 100],
                msg: 'La contraseña debe tener entre 4 y 100 caracteres'
            }
        }
    },
    nombre_emp: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre no puede estar vacío'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres'
            },
            is: {
                args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                msg: 'El nombre solo puede contener letras y espacios'
            }
        }
    },
    apellido_emp: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El apellido no puede estar vacío'
            },
            len: {
                args: [2, 100],
                msg: 'El apellido debe tener entre 2 y 100 caracteres'
            },
            is: {
                args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                msg: 'El apellido solo puede contener letras y espacios'
            }
        }
    },
    cedula_emp: {
        type: DataTypes.STRING(20),
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
                args: [5, 20],
                msg: 'La cédula debe tener entre 5 y 20 caracteres'
            }
        }
    },
    cargo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El cargo no puede estar vacío'
            },
            len: {
                args: [2, 100],
                msg: 'El cargo debe tener entre 2 y 100 caracteres'
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