import express from 'express';
import { atributoController } from '../controllers/atributoController.js';

const router = express.Router();

router.get('/', atributoController.findAll);
router.post('/', atributoController.create);
router.put('/:id', atributoController.update);
router.delete('/:id', atributoController.delete);

export default router;