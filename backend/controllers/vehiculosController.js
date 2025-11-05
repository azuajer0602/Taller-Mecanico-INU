import { Vehiculo } from '../../../models/Vehiculo.js';

export const vehiculoController = {
    // CREATE - Crear nuevo vehículo
    async create(req, res) {
        try {
            const vehiculoId = await Vehiculo.create(req.body);
            const nuevoVehiculo = await Vehiculo.findByMatricula(vehiculoId);
            
            res.status(201).json({
                success: true,
                message: 'Vehículo registrado exitosamente',
                data: nuevoVehiculo
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // READ - Obtener todos los vehículos
    async findAll(req, res) {
        try {
            const vehiculos = await Vehiculo.findAll();
            
            res.json({
                success: true,
                data: vehiculos
            });
        } catch (error) {
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
            const vehiculo = await Vehiculo.findByMatricula(matricula);
            
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
            const updated = await Vehiculo.update(matricula, req.body);
            
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehículo no encontrado'
                });
            }
            
            const vehiculoActualizado = await Vehiculo.findByMatricula(matricula);
            
            res.json({
                success: true,
                message: 'Vehículo actualizado exitosamente',
                data: vehiculoActualizado
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // DELETE - Eliminar vehículo
    async delete(req, res) {
        try {
            const { matricula } = req.params;
            const deleted = await Vehiculo.delete(matricula);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehículo no encontrado'
                });
            }
            
            res.json({
                success: true,
                message: 'Vehículo eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar vehículo: ' + error.message
            });
        }
    },

    // Obtener vehículos para diagnóstico
    async findForDiagnostico(req, res) {
        try {
            const vehiculos = await Vehiculo.findVehiculosParaDiagnostico();
            
            res.json({
                success: true,
                data: vehiculos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener vehículos para diagnóstico: ' + error.message
            });
        }
    }
};