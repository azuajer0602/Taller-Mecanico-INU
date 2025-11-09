import express from 'express';
import { diagnosticoController } from '../controllers/DiagnosticoController.js';

const router = express.Router();

// GET /api/diagnosticos - Obtener todos los diagnósticos
router.get('/', diagnosticoController.findAll);

// GET /api/diagnosticos/vehiculo/:vehiculoId - Obtener diagnósticos por vehículo
router.get('/vehiculo/:vehiculoId', diagnosticoController.findByVehiculo);

// GET /api/diagnosticos/:id - Obtener diagnóstico por ID
router.get('/:id', diagnosticoController.findById);

// POST /api/diagnosticos - Crear nuevo diagnóstico
router.post('/', diagnosticoController.create);

// PUT /api/diagnosticos/:id - Actualizar diagnóstico
router.put('/:id', diagnosticoController.update);

// DELETE /api/diagnosticos/:id - Eliminar diagnóstico
router.delete('/:id', diagnosticoController.delete);

export default router;