import { Diagnostico } from '../models/Diagnostico.js';

export const diagnosticoController = {
    // CREATE - Crear nuevo diagnóstico
    async create(req, res) {
        try {
            const { id_vehiculo, sistemas } = req.body;
            
            if (!id_vehiculo) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del vehículo es requerido'
                });
            }

            // Crear descripción general basada en los sistemas
            const descrip_falla = this.generarDescripcionGeneral(sistemas);
            
            const diagnosticoData = {
                id_vehiculo,
                descrip_falla,
                fecha_ingreso: new Date(),
                sistemas
            };

            const num_diagnostico = await Diagnostico.create(diagnosticoData);
            const nuevoDiagnostico = await Diagnostico.findById(num_diagnostico);
            
            res.status(201).json({
                success: true,
                message: 'Diagnóstico creado exitosamente',
                data: nuevoDiagnostico
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // READ - Obtener todos los diagnósticos
    async findAll(req, res) {
        try {
            const diagnosticos = await Diagnostico.findAll();
            
            res.json({
                success: true,
                data: diagnosticos
            });
        } catch (error) {
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
            const diagnostico = await Diagnostico.findById(id);
            
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
            const diagnosticos = await Diagnostico.findByVehiculo(vehiculoId);
            
            res.json({
                success: true,
                data: diagnosticos
            });
        } catch (error) {
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
            const { sistemas } = req.body;

            const updated = await Diagnostico.update(id, { sistemas });
            
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Diagnóstico no encontrado'
                });
            }
            
            const diagnosticoActualizado = await Diagnostico.findById(id);
            
            res.json({
                success: true,
                message: 'Diagnóstico actualizado exitosamente',
                data: diagnosticoActualizado
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // DELETE - Eliminar diagnóstico
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await Diagnostico.delete(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Diagnóstico no encontrado'
                });
            }
            
            res.json({
                success: true,
                message: 'Diagnóstico eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar diagnóstico: ' + error.message
            });
        }
    },

    // Helper para generar descripción general
    generarDescripcionGeneral(sistemas) {
        const problemas = [];
        
        Object.keys(sistemas).forEach(sistema => {
            const datosSistema = sistemas[sistema];
            if (datosSistema.estado !== 'optimo' || datosSistema.fallas.length > 0) {
                problemas.push(`${sistema}: ${datosSistema.estado}`);
            }
        });

        return problemas.length > 0 
            ? `Problemas detectados en: ${problemas.join(', ')}`
            : 'Vehículo en óptimas condiciones';
    }
};