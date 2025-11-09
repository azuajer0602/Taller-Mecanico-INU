import { Router } from 'express';
import Empleado from '../models/Empleado.js'; 
import { 
    login, 
    register, 
    deleteEmpleado, 
    updateEmpleado 
} from '../controllers/empController.js';

const router = Router();

router.post('/login', login);

// Módulo de registro
router.post('/register', register);

// Módulo de eliminación de empleados
router.delete('/delete', deleteEmpleado);

// Módulo de actualización de datos de empleados
router.put('/update', updateEmpleado);

export default router;