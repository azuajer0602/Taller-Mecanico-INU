import express from 'express';
import { vehiculoController } from '../controllers/vehiculoController.js'; // ← CORREGIDO

const router = express.Router();

// GET /api/vehiculos - Obtener todos los vehículos
router.get('/', vehiculoController.findAll);

// GET /api/vehiculos/diagnostico - Vehículos disponibles para diagnóstico
router.get('/diagnostico', vehiculoController.findForDiagnostico);

// GET /api/vehiculos/:matricula - Obtener vehículo por matrícula
router.get('/:matricula', vehiculoController.findById);

// POST /api/vehiculos - Crear nuevo vehículo
router.post('/', vehiculoController.create);

// PUT /api/vehiculos/:matricula - Actualizar vehículo
router.put('/:matricula', vehiculoController.update);

// DELETE /api/vehiculos/:matricula - Eliminar vehículo
router.delete('/:matricula', vehiculoController.delete);

export default router;