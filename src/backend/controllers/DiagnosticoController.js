import { Diagnostico } from '../models/Diagnostico.js';
import { Vehiculo } from '../models/Vehiculo.js';

export const diagnosticoController = {
    // CREATE - Crear nuevo diagnóstico
    async create(req, res) {
        try {
            const { id_vehiculo, descrip_falla } = req.body;
            
            // Validación según tu BD
            if (!id_vehiculo) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del vehículo es requerido'
                });
            }

            // ✅ VALIDACIÓN AGREGADA: descrip_falla requerida
            if (!descrip_falla) {
                return res.status(400).json({
                    success: false,
                    message: 'La descripción de la falla es requerida'
                });
            }

            // Verificar que el vehículo existe (FK constraint)
            const vehiculo = await Vehiculo.findByPk(id_vehiculo);
            if (!vehiculo) {
                return res.status(404).json({
                    success: false,
                    message: 'El vehículo no existe'
                });
            }

            // ✅ SOLUCIÓN MEJORADA: Usar Sequelize normalmente
            const nuevoDiagnostico = await Diagnostico.create({
                id_vehiculo,
                descrip_falla,
                fecha_ingreso: new Date()
            });

            res.status(201).json({
                success: true,
                message: 'Diagnóstico creado exitosamente',
                data: nuevoDiagnostico
            });
        } catch (error) {
            console.error('Error creando diagnóstico:', error);
            
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(400).json({
                    success: false,
                    message: 'El vehículo especificado no existe'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor: ' + error.message
            });
        }
    },

    // READ - Obtener todos los diagnósticos
    async findAll(req, res) {
        try {
            const diagnosticos = await Diagnostico.findAll({
                order: [['fecha_ingreso', 'DESC']]
            });
            
            res.json({
                success: true,
                count: diagnosticos.length,
                data: diagnosticos
            });
        } catch (error) {
            console.error('Error obteniendo diagnósticos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener diagnósticos: ' + error.message
            });
        }
    },

    // READ - Obtener diagnóstico por ID
    async findById(req, res) {
        try {
            const { id } = req.params;
            const diagnostico = await Diagnostico.findByPk(id);
            
            if (!diagnostico) {
                return res.status(404).json({
                    success: false,
                    message: 'Diagnóstico no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: diagnostico
            });
        } catch (error) {
            console.error('Error obteniendo diagnóstico:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener diagnóstico: ' + error.message
            });
        }
    },

    // READ - Obtener diagnósticos por vehículo
    async findByVehiculo(req, res) {
        try {
            const { vehiculoId } = req.params;
            
            // Verificar que el vehículo existe
            const vehiculo = await Vehiculo.findByPk(vehiculoId);
            if (!vehiculo) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehículo no encontrado'
                });
            }

            const diagnosticos = await Diagnostico.findAll({
                where: { id_vehiculo: vehiculoId },
                order: [['fecha_ingreso', 'DESC']]
            });
            
            res.json({
                success: true,
                count: diagnosticos.length,
                data: diagnosticos
            });
        } catch (error) {
            console.error('Error obteniendo diagnósticos del vehículo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener diagnósticos del vehículo: ' + error.message
            });
        }
    },

    // UPDATE - Actualizar diagnóstico
    async update(req, res) {
        try {
            const { id } = req.params;
            const { descrip_falla } = req.body;

            // ✅ VALIDACIÓN AGREGADA: descrip_falla requerida en actualización
            if (descrip_falla !== undefined && !descrip_falla) {
                return res.status(400).json({
                    success: false,
                    message: 'La descripción de la falla no puede estar vacía'
                });
            }

            const diagnostico = await Diagnostico.findByPk(id);
            
            if (!diagnostico) {
                return res.status(404).json({
                    success: false,
                    message: 'Diagnóstico no encontrado'
                });
            }

            // Actualizar SOLO campos que existen en tu BD
            if (descrip_falla !== undefined) {
                diagnostico.descrip_falla = descrip_falla;
            }

            await diagnostico.save();

            res.json({
                success: true,
                message: 'Diagnóstico actualizado exitosamente',
                data: diagnostico
            });
        } catch (error) {
            console.error('Error actualizando diagnóstico:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar diagnóstico: ' + error.message
            });
        }
    },

    // DELETE - Eliminar diagnóstico
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const diagnostico = await Diagnostico.findByPk(id);
            
            if (!diagnostico) {
                return res.status(404).json({
                    success: false,
                    message: 'Diagnóstico no encontrado'
                });
            }

            await diagnostico.destroy();
            
            res.json({
                success: true,
                message: 'Diagnóstico eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando diagnóstico:', error);
            
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el diagnóstico porque tiene registros relacionados'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al eliminar diagnóstico: ' + error.message
            });
        }
    }
};