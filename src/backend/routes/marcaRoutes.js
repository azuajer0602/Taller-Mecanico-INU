import express from 'express';
import { marcaController } from '../controllers/marcaController.js';

const router = express.Router();

router.get('/', marcaController.findAll);
router.post('/', marcaController.create);
router.put('/:id', marcaController.update);
router.delete('/:id', marcaController.delete);

export default router;