import  Empleado from '../../models/empleado.js';
import { ValidationError, UniqueConstraintError } from 'sequelize';

const empleadoController = {
    
    async crearEmpleado(req, res) {
        try {
            const {
                usuario,
                contrasena,
                nombre_emp,
                apellido_emp,
                cedula_emp,
                cargo,
                fecha_contratacion,
                sueldo_base
            } = req.body;

            const camposRequeridos = [
                'usuario', 'contrasena', 'nombre_emp', 
                'apellido_emp', 'cedula_emp', 'cargo', 
                'fecha_contratacion', 'sueldo_base'
            ];
            
            const camposFaltantes = camposRequeridos.filter(campo => !req.body[campo]);
            
            if (camposFaltantes.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
                });
            }

            const nuevoEmpleado = await Empleado.create({
                usuario,
                contrasena,
                nombre_emp,
                apellido_emp,
                cedula_emp,
                cargo,
                fecha_contratacion,
                sueldo_base: parseFloat(sueldo_base)
            });

            res.status(201).json({
                success: true,
                message: 'Empleado creado exitosamente',
                data: nuevoEmpleado
            });

        } catch (error) {
            console.error('Error al crear empleado:', error);
            
            if (error instanceof ValidationError) {
                const errores = error.errors.map(err => ({
                    campo: err.path,
                    mensaje: err.message
                }));
                
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: errores
                });
            }
            
            if (error instanceof UniqueConstraintError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de duplicación',
                    error: 'El usuario o cédula ya existen en el sistema'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    },

    async obtenerEmpleados(req, res) {
        try {
            const empleados = await Empleado.findAll({
                attributes: { exclude: ['contrasena'] }
            });

            res.status(200).json({
                success: true,
                data: empleados
            });

        } catch (error) {
            console.error('Error al obtener empleados:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener empleados',
                error: error.message
            });
        }
    },

    async obtenerEmpleadoPorId(req, res) {
        try {
            const { id } = req.params;

            const empleado = await Empleado.findByPk(id, {
                attributes: { exclude: ['contrasena'] }
            });

            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: empleado
            });

        } catch (error) {
            console.error('Error al obtener empleado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener empleado',
                error: error.message
            });
        }
    },

    async actualizarEmpleado(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;

            const empleado = await Empleado.findByPk(id);
            
            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }

            if (datosActualizados.sueldo_base) {
                datosActualizados.sueldo_base = parseFloat(datosActualizados.sueldo_base);
            }

            await empleado.update(datosActualizados);

            res.status(200).json({
                success: true,
                message: 'Empleado actualizado exitosamente',
                data: empleado
            });

        } catch (error) {
            console.error('Error al actualizar empleado:', error);
            
            if (error instanceof ValidationError) {
                const errores = error.errors.map(err => ({
                    campo: err.path,
                    mensaje: err.message
                }));
                
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: errores
                });
            }
            
            if (error instanceof UniqueConstraintError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de duplicación',
                    error: 'El usuario o cédula ya existen en el sistema'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al actualizar empleado',
                error: error.message
            });
        }
    },

    async eliminarEmpleado(req, res) {
        try {
            const { id } = req.params;

            const empleado = await Empleado.findByPk(id);
            
            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }

            await empleado.destroy();

            res.status(200).json({
                success: true,
                message: 'Empleado eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar empleado',
                error: error.message
            });
        }
    },

    async login(req, res) {
        try {
            const { usuario, contrasena } = req.body;

            if (!usuario || !contrasena) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario y contraseña son requeridos'
                });
            }

            const empleado = await Empleado.findOne({
                where: { usuario }
            });

            if (!empleado) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            if (empleado.contrasena !== contrasena) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            const empleadoSinPassword = { ...empleado.toJSON() };
            delete empleadoSinPassword.contrasena;

            res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: empleadoSinPassword
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
};

export default empleadoController;