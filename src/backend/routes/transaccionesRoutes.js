import express from 'express';
import {
  getAllTransacciones,
  getTransaccionById,
  createTransaccion,
  getTransaccionesByFecha,
  cambiarEstadoTransaccion
} from '../controllers/transaccionesController.js';

const router = express.Router();

router.get('/', getAllTransacciones);
router.get('/:id', getTransaccionById);
router.post('/', createTransaccion);
router.get('/fecha/rango', getTransaccionesByFecha);
router.put('/:id/estado', cambiarEstadoTransaccion);
export default router;