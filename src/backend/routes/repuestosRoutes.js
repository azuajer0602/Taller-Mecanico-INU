import { Router } from 'express';
import Empleado from '../models/Empleado.js'; 
import {  
    repuestoRegistro, 
    deleteRepuesto, 
    updatedRepuesto, 
    obtenerRepuestos
} from '../controllers/repuestoController.js';

const router = Router();

router.post('/registerRep', repuestoRegistro);
router.delete('/deleteRep', deleteRepuesto);
router.put('/updateRep', updatedRepuesto);
router.get('/obtenerRep', obtenerRepuestos);

export default router;