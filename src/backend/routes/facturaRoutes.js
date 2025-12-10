import express from 'express';
import { facturaController } from '../controllers/facturaController.js';

const router = express.Router();

// POST /api/facturas -> Crear una nueva factura
router.post('/', facturaController.create);

// GET /api/facturas -> Obtener todas las facturas
router.get('/', facturaController.findAll);

// GET /api/facturas/:id -> Obtener una factura específica por su ID
router.get('/:id', facturaController.findById);

// PATCH /api/facturas/:id -> Actualizar el estado de una factura (pagar, anular, etc.)
router.patch('/:id', facturaController.update);

// POST /api/facturas/:id/pdf -> Generar y guardar el PDF de la factura
router.post('/:id/pdf', facturaController.generatePdf);

export default router;