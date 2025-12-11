// src/backend/routes/vehiculoRoutes.js

import express from 'express';
import { vehiculoController } from '../controllers/vehiculoController.js';

const router = express.Router();

// 1. PRIMERO las rutas específicas
router.get('/', vehiculoController.findAll);
router.get('/diagnostico', vehiculoController.findForDiagnostico); // <--- ESTA DEBE IR ANTES DE /:matricula

// 2. LUEGO las rutas dinámicas (que reciben parámetros)
router.get('/:matricula', vehiculoController.findById); 
router.post('/', vehiculoController.create);
router.put('/:matricula', vehiculoController.update);
router.delete('/:matricula', vehiculoController.delete);

export default router;