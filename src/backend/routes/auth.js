import { Router } from 'express';
import Empleado from '../models/Empleado.js'; 
import { 
    login, 
    register, 
    deleteEmpleado, 
    updateEmpleado, 
    obtenerTodos
} from '../controllers/empController.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.delete('/delete', deleteEmpleado);
router.put('/update', updateEmpleado);
router.get('/obtener', obtenerTodos);

export default router;