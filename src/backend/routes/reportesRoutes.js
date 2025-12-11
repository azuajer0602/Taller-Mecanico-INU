import express from 'express';
import { reportesController } from '../controllers/reportesController.js';

const router = express.Router();

router.get('/productos', reportesController.ventasPorProducto);
router.get('/clientes', reportesController.ventasPorCliente);
router.get('/tendencias', reportesController.tendenciasVentas);
router.get('/rrhh-mecanicos', reportesController.desempenoMecanicos);
export default router;