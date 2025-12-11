import express from 'express';
// Asegúrate de que el nombre del archivo coincida (mayúscula o minúscula según lo guardaste)
import { diagnosticoController } from '../controllers/DiagnosticoController.js';

const router = express.Router();

// --- RUTA PRINCIPAL DE DIAGNÓSTICO ---
// Esta es la que llama tu Frontend cuando haces click en "Finalizar Diagnóstico"
// POST /api/diagnosticos
router.post('/', diagnosticoController.registrar);


// --- OTRAS RUTAS (Opcionales por ahora) ---
// Si en el futuro agregas métodos para listar diagnósticos en el controlador, 
// descomenta estas líneas:

// router.get('/', diagnosticoController.findAll);
// router.get('/:id', diagnosticoController.findById);

export default router;