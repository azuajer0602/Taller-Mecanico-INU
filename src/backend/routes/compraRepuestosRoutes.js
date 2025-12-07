import express from 'express';
import {
  obtenerComprasRepuestos,
  registrarCompraRepuesto,
  eliminarCompraRepuesto,
  actualizarCompraRepuesto,
  obtenerCompraPorId
} from '../controllers/compraRepuestosController.js';

const router = express.Router();

router.get('/', obtenerComprasRepuestos);
router.get('/:id', obtenerCompraPorId);
router.post('/', registrarCompraRepuesto);
router.put('/', actualizarCompraRepuesto);
router.delete('/', eliminarCompraRepuesto);

export default router;