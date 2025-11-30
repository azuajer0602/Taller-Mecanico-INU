import Vehiculo from '../models/Vehiculo.js';
import Diagnostico from '../models/Diagnostico.js';

export const vehiculoController = {
    // CREATE - Crear nuevo vehículo
    async create(req, res) {
        try {
            const { matricula, marca, modelo, afio, color, id_cliente } = req.body;

            // Validación según tu BD - matricula es PK y NOT NULL
            if (!matricula) {
                return res.status(400).json({
                    success: false,
                    message: 'La matrícula es obligatoria'
                });
            }

            // Crear vehículo EXACTAMENTE como está en tu BD
            const nuevoVehiculo = await Vehiculo.create({
                matricula,
                marca,
                modelo,
                afio,
                color,
                id_cliente: id_cliente || null
            });

            res.status(201).json({
                success: true,
                message: 'Vehículo registrado exitosamente',
                data: nuevoVehiculo
            });
        } catch (error) {
            console.error('Error creando vehículo:', error);
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
                    success: false,
                    message: 'La matrícula ya está registrada'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor: ' + error.message
            });
        }
    },

    // READ - Obtener todos los vehículos
    async findAll(req, res) {
        try {
            const vehiculos = await Vehiculo.findAll({
                order: [['marca', 'ASC'], ['modelo', 'ASC']]
            });
            
            res.json({
                success: true,
                count: vehiculos.length,
                data: vehiculos
            });
        } catch (error) {
            console.error('Error obteniendo vehículos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener vehículos: ' + error.message
            });
        }
    },

    // READ - Obtener vehículo por matrícula
    async findById(req, res) {
        try {
            const { matricula } = req.params;
            const vehiculo = await Vehiculo.findByPk(matricula);
            
            if (!vehiculo) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehículo no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: vehiculo
            });
        } catch (error) {
            console.error('Error obteniendo vehículo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener vehículo: ' + error.message
            });
        }
    },

    // UPDATE - Actualizar vehículo
    async update(req, res) {
        try {
            const { matricula } = req.params;
            const { marca, modelo, afio, color, id_cliente } = req.body;

            const vehiculo = await Vehiculo.findByPk(matricula);
            
            if (!vehiculo) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehículo no encontrado'
                });
            }

            // Actualizar SOLO campos que existen en tu BD
            if (marca !== undefined) vehiculo.marca = marca;
            if (modelo !== undefined) vehiculo.modelo = modelo;
            if (afio !== undefined) vehiculo.afio = afio;
            if (color !== undefined) vehiculo.color = color;
            if (id_cliente !== undefined) vehiculo.id_cliente = id_cliente;

            await vehiculo.save();

            res.json({
                success: true,
                message: 'Vehículo actualizado exitosamente',
                data: vehiculo
            });
        } catch (error) {
            console.error('Error actualizando vehículo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar vehículo: ' + error.message
            });
        }
    },

    // DELETE - Eliminar vehículo
    async delete(req, res) {
        try {
            const { matricula } = req.params;
            
            const vehiculo = await Vehiculo.findByPk(matricula);
            
            if (!vehiculo) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehículo no encontrado'
                });
            }

            // Verificar relación con diagnostico (FK constraint)
            const diagnosticosCount = await Diagnostico.count({
                where: { id_vehiculo: matricula }
            });

            if (diagnosticosCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el vehículo porque tiene diagnósticos asociados'
                });
            }

            await vehiculo.destroy();
            
            res.json({
                success: true,
                message: 'Vehículo eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando vehículo:', error);
            
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el vehículo porque tiene registros relacionados'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al eliminar vehículo: ' + error.message
            });
        }
    },

    // Obtener vehículos para diagnóstico (sin diagnósticos)
    async findForDiagnostico(req, res) {
        try {
            const vehiculos = await Vehiculo.findAll({
                attributes: ['matricula', 'marca', 'modelo', 'afio', 'color'],
                where: {
                    matricula: {
                        [Symbol.for('notIn')]: Vehiculo.sequelize.literal(`
                            (SELECT id_vehiculo FROM diagnostico)
                        `)
                    }
                },
                order: [['marca', 'ASC'], ['modelo', 'ASC']]
            });

            res.json({
                success: true,
                count: vehiculos.length,
                data: vehiculos
            });
        } catch (error) {
            console.error('Error obteniendo vehículos para diagnóstico:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener vehículos para diagnóstico: ' + error.message
            });
        }
    }
};