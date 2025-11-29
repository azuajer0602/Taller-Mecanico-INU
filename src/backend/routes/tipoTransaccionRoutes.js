import express from 'express';
// CORRECCIÓN: Importamos 'getAllTipos' porque así se llama en tu controlador
import { getAllTipos } from '../controllers/tipoTransaccionController.js';

const router = express.Router();

// Ruta raíz: se combina con el prefijo de app.js para formar /api/tipos-transaccion
router.get('/', getAllTipos); 

export default router;