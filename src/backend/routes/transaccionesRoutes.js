import express from 'express';
import {
  getAllTransacciones,
  getTransaccionById,
  createTransaccion,
  getTransaccionesByFecha
} from '../controllers/transaccionesController.js';

const router = express.Router();

router.get('/', getAllTransacciones);
router.get('/:id', getTransaccionById);
router.post('/', createTransaccion);
router.get('/fecha/rango', getTransaccionesByFecha);

export default router;