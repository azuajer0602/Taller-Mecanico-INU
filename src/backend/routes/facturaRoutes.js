import express from 'express';
import { facturaController } from '../controllers/facturaController.js';

const router = express.Router();

// Crear
router.post('/', facturaController.create);

// Listar todas (Esta era la que fallaba antes)
router.get('/', facturaController.findAll);

// Obtener una
router.get('/:id', facturaController.findById);

// Actualizar estado
router.patch('/:id', facturaController.update);

// Generar PDF
router.post('/:id/pdf', facturaController.generatePdf);

export default router;