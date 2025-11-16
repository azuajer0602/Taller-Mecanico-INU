
import Empleado from '../models/Empleado.js'; 

const isNumeric = (value) => {
    if (value === null || value === undefined) return false;
    const strValue = String(value);
    return /^\d+(\.\d+)?$/.test(strValue) && !isNaN(parseFloat(strValue));
};


//funcion para recibir fecha ya sea entre comillas "" o solo numeros

const formatNumericDate = (numericDate) => {
    const dateString = String(numericDate);
    if (dateString.length !== 8) return null;
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const monthInt = parseInt(month, 10);
    const dayInt = parseInt(day, 10);
    
    if (monthInt < 1 || monthInt > 12 || dayInt < 1 || dayInt > 31) {
        return null; 
    }
    return `${year}-${month}-${day}`;
};

//aqui la funcion para evitar ingresar fechas futuras
const fechafutura = (formattedDate) => {
    const dateToCheck = new Date(formattedDate);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    return dateToCheck <= today;
};


//modulo de login

export const login = async (req, res) => {

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
};


//modulo de registro
export const register = async (req, res) => {
    
    const { usuario, password, nombre, apellido,cedula , cargo, contratacion, sueldo } = req.body; 

    if (!usuario || !password || !nombre|| !apellido || !cedula || !cargo|| !contratacion || !sueldo) {
      return res.status(400).json({ message: 'Se requiere llenar todos los campos.' });
    }

    if (!isNumeric(cedula)) {
        return res.status(400).json({ message: 'La cédula debe contener solo números.' });
    }

    if (!isNumeric(sueldo)) {
        return res.status(400).json({ message: 'El sueldo debe contener solo números.' });
    }

    const fecha_formateada = formatNumericDate(contratacion);

    if (!fecha_formateada) {
        return res.status(400).json({ message: 'La fecha de contratación debe tener un formato numérico válido.' });
    }

    if (!fechafutura(fecha_formateada)) {
        return res.status(400).json({ message: 'La fecha de contratación no puede ser una fecha futura.' });
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
            fecha_contratacion: fecha_formateada,
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
};


//modulo de eliminacion de empleados

export const deleteEmpleado = async (req, res) => {

    const { id } = req.body;

    if (!id || !isNumeric(id)) {
        return res.status(400).json({ message: 'Se requiere un ID de empleado numérico en el cuerpo de la solicitud.' });
    }

    try {
        const count = await Empleado.destroy({
            where: {
                id_empleado: id
            }
        });

        if (count === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        res.status(200).json({ message: 'Empleado eliminado exitosamente.' });

    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        res.status(500).json({ message: 'Error del servidor al eliminar.' });
    }
};


//modulo de actualizacion de datos de empleados
export const updateEmpleado = async (req, res) => {

    const { id } = req.body;
    const { usuario, password, nombre, apellido, cedula, cargo, contratacion, sueldo 
    } = req.body; 

    if (!id || !isNumeric(id)) {
        return res.status(400).json({ message: 'Se requiere un ID de empleado numérico para actualizar.' });
    }

    const updateData = {};

    if (usuario) updateData.usuario = usuario;
    if (password) updateData.contrasena = password;
    if (nombre) updateData.nombre_emp = nombre;
    if (apellido) updateData.apellido_emp = apellido;
    if (cedula) updateData.cedula_emp = cedula;
    if (cargo) updateData.cargo = cargo;
    if (contratacion) updateData.fecha_contratacion = contratacion;
    if (sueldo) updateData.sueldo_base = sueldo;

    if (cedula !== undefined) {
        if (!isNumeric(cedula)) {
            return res.status(400).json({ message: 'La cédula debe contener solo números.' });
        }
        updateData.cedula_emp = String(cedula);
    }

    if (sueldo !== undefined) {
        if (!isNumeric(sueldo)) {
            return res.status(400).json({ message: 'El sueldo debe contener solo números.' });
        }
        updateData.sueldo_base = parseFloat(sueldo);
    }
    
    if (contratacion !== undefined) {
        
        if (!isNumeric(contratacion) || String(contratacion).length !== 8) {
             return res.status(400).json({ message: 'La fecha de contratación debe ser un número de 8 dígitos en formato YYYYMMDD (ej: 20220912).' });
        }
        
        const fecha_formateada = formatNumericDate(contratacion);

        if (!fecha_formateada) {
             return res.status(400).json({ message: 'El formato de la fecha YYYYMMDD es incorrecto (mes o día fuera de rango).' });
        }

        if (!fechafutura(fecha_formateada)) {
            return res.status(400).json({ message: 'La fecha de contratación no puede ser una fecha futura.' });
        }
        updateData.fecha_contratacion = fecha_formateada;
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
    }


    try {
 
        const [updatedRowsCount] = await Empleado.update(updateData, {
            where: {
                id_empleado: id
            },

        });

        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado o no hubo cambios en los datos.' });
        }

        const updatedEmpleado = await Empleado.findByPk(id);

        res.status(200).json({ 
            message: 'Empleado actualizado exitosamente.',
            empleado: updatedEmpleado
        });

    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar.' });
    }
};
