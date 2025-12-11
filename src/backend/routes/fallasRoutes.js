import express from 'express';
import { fallaController } from '../controllers/fallaController.js';

const router = express.Router();

router.get('/', fallaController.findAll);
router.post('/', fallaController.create);
router.put('/:id', fallaController.update); 
router.delete('/:id', fallaController.delete);

export default router;