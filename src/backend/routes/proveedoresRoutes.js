import { Router } from 'express';
import Empleado from '../models/Empleado.js'; 
import {  
    proveedorRegistro, 
    deleteProveedor, 
    updatedProveedor, 
    obtenerProveedores
} from '../controllers/proveedorController.js';

const router = Router();

router.post('/registerPro', proveedorRegistro);
router.delete('/deletePro', deleteProveedor);
router.put('/updatePro', updatedProveedor);
router.get('/obtenerPro', obtenerProveedores);

export default router;