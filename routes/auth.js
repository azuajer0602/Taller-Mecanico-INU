import { Router } from 'express';
import Empleado from '../models/Empleado.js'; 
import bcrypt from 'bcryptjs';

const router = Router();
router.post('/login', async (req, res) => {

  const { usuario, password } = req.body; 

  if (!usuario || !password) {
    return res.status(400).json({ message: 'Se requiere usuario y contraseña.' });
  }

  try {
    const empleado = await Empleado.findOne({ where: { usuario } }); 

    if (!empleado) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const isMatch = await empleado.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    res.json({ 
        message: 'Login exitoso', 
        empleado: { 
            id: empleado.id_empleado, 
            usuario: empleado.usuario,
        } 
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
});

router.post('/register', async (req, res) => {
    const { usuario, password, nombre, apellido,cedula , cargo, contratacion, sueldo } = req.body; 

    if (!usuario || !password || !nombre|| !apellido || !cedula || !cargo|| !contratacion || !sueldo) {
      return res.status(400).json({ message: 'Se requiere llenar todos los campos.' });
    }

    try {
        const existingEmpleado = await Empleado.findOne({ where: { usuario } || {cedula} });

        if (existingEmpleado) {
            return res.status(409).json({ message: 'El usuario o cedula ya está en uso.' });}


        const newEmpleado = await Empleado.create({ 
            usuario: usuario, 
            contrasena: password,
            nombre_emp: nombre,
            apellido_emp: apellido,
            cedula_emp: cedula,
            cargo: cargo,
            fecha_contratacion: contratacion,
            sueldo_base: sueldo 
        });

        res.status(201).json({ 
            message: 'Empleado registrado exitosamente', 
            empleado: { 
                id: newEmpleado.id_empleado, 
                usuario: newEmpleado.usuario 
            } 
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor al registrar.' });
    }
});


export default router;