import express from 'express';
import { servicioController } from '../controllers/servicioController.js';

const router = express.Router();

// 1. Obtener todos los servicios (Para la tabla del Admin y el Mecánico)
router.get('/', servicioController.findAll);

// 2. Obtener lista de empleados/mecánicos (Para el select de asignación)
router.get('/mecanicos', servicioController.getMecanicos);

// 3. Asignar un mecánico a un servicio (Admin)
router.put('/:id/asignar', servicioController.asignar);

// 4. Cambiar estado y registrar mano de obra (Mecánico)
router.put('/:id/estado', servicioController.cambiarEstado);

export default router;