
import Proveedor from '../models/Proveedor.js';

const isNumeric = (value) => {
    if (value === null || value === undefined) return false;
    const strValue = String(value);
    return /^\d+(\.\d+)?$/.test(strValue) && !isNaN(parseFloat(strValue));
};


//modulo de registro
export const proveedorRegistro = async (req, res) => {
    
    const { id_proveedor, nombre_fiscal, rif_juridico, telefono_proveedor,direccion_proveedor } = req.body; 

    if (!id_proveedor || !nombre_fiscal || !rif_juridico || !telefono_proveedor || !direccion_proveedor ) {
      return res.status(400).json({ message: 'Se requiere llenar todos los campos.' });
    }

    if (!isNumeric(rif_juridico)) {
        return res.status(400).json({ message: 'El rif debe contener solo números.' });
    }

    if (!isNumeric(telefono_proveedor)) {
        return res.status(400).json({ message: 'El numero de telefono debe contener solo números.' });
    }

    try {

        const existingProveedor = await Proveedor.findOne({ where: { nombre_fiscal } || {rif_juridico} });

        if (existingProveedor) {
            return res.status(409).json({ message: 'El usuario o rif ya está en uso.' });}


        const newProveedor = await Proveedor.create({ 
            id_proveedor: id, 
            nombre_fiscal: nombre,
            rif_juridico: rif,
            telefono_proveedor: telefono,
            direccion_proveedor: direccion
        });

        res.status(201).json({ 
            message: 'Proveedor registrado exitosamente', 
            proveedor: { 
                id: newProveedor.id_proveedor, 
                nombre: newProveedor.nombre_fiscal 
            } 
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor al registrar.' });
    }
};


//modulo de eliminacion de empleados

export const deleteProveedor = async (req, res) => {

    const { id } = req.body;

    if (!id || !isNumeric(id)) {
        return res.status(400).json({ message: 'Se requiere un ID de proveedor numérico en el cuerpo de la solicitud.' });
    }

    try {
        const count = await Proveedor.destroy({
            where: {
                id_proveedor: id
            }
        });

        if (count === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado.' });
        }

        res.status(200).json({ message: 'Proveedor eliminado exitosamente.' });

    } catch (error) {
        console.error('Error al eliminar Proveedor:', error);
        res.status(500).json({ message: 'Error del servidor al eliminar.' });
    }
};


//modulo de actualizacion de datos de empleados
export const updatedProveedor = async (req, res) => {

    const { id } = req.body;
    const { nombre, rif, telefono, direccion} = req.body; 

    if (!id || !isNumeric(id)) {
        return res.status(400).json({ message: 'Se requiere un ID de Proveedor numérico para actualizar.' });
    }

    const updateData = {};

    if (nombre) updateData.nombre_fiscal = nombre;
    if (rif) updateData.rif_juridico = rif;
    if (telefono) updateData.telefono_proveedor = telefono;
    if (direccion) updateData.direccion_proveedor = direccion;

    if (rif !== undefined) {
        if (!isNumeric(rif)) {
            return res.status(400).json({ message: 'El RIF debe contener solo números.' });
        }
        updateData.rif_juridico = String(rif);
    }

    if (telefono !== undefined) {
        if (!isNumeric(telefono)) {
            return res.status(400).json({ message: 'El sueldo debe contener solo números.' });
        }
        updateData.telefono_proveedor = String(telefono);
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
    }


    try {
 
        const [updatedRowsCount] = await Proveedor.update(updateData, {
            where: {
                id_proveedor: id
            },

        });

        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado o no hubo cambios en los datos.' });
        }

        const updatedProveedor = await Proveedor.findByPk(id);

        res.status(200).json({ 
            message: 'Proveedor actualizado exitosamente.',
            proveedor: updatedProveedor
        });

    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar.' });
    }
};