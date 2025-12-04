
import Proveedor from '../models/Proveedor.js';

const isNumeric = (value) => {
    if (value === null || value === undefined) return false;
    const strValue = String(value);
    return /^\d+(\.\d+)?$/.test(strValue) && !isNaN(parseFloat(strValue));
};


//obtener todos los proveedores
export const obtenerProveedores = async (req , res) => {
    try {
        const proveedores = await Proveedor.findAll({
            attributes: { exclude: [''] } 
        });

        if (proveedores.length === 0) {
            return res.status(404).json({ message: 'No hay Proveedores registrados.' });
        }

        res.status(200).json({
            message: 'Lista de Proveedores obtenida exitosamente.',
            proveedores: proveedores
        });

    } catch (error) {
        console.error('Error al obtener todos los Proveedores:', error);
        res.status(500).json({ message: 'Error del servidor al obtener Proveedores.' });
    }
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
            id_proveedor: id_proveedor, 
            nombre_fiscal: nombre_fiscal, 
            rif_juridico: rif_juridico, 
            telefono_proveedor: telefono_proveedor, 
            direccion_proveedor: direccion_proveedor
        });

        res.status(201).json({ 
            message: 'Proveedor registrado exitosamente', 
            proveedor: { 
                id_proveedor: newProveedor.id_proveedor, 
                nombre_fiscal: newProveedor.nombre_fiscal 
            } 
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor al registrar.' });
    }
};


//modulo de eliminacion de empleados

export const deleteProveedor = async (req, res) => {

    const { id_proveedor } = req.body;

    if (!id_proveedor || !isNumeric(id_proveedor)) {
        return res.status(400).json({ message: 'Se requiere un ID de proveedor numérico en el cuerpo de la solicitud.' });
    }

    try {
        const count = await Proveedor.destroy({
            where: {
                id_proveedor: id_proveedor
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


export const updatedProveedor = async (req, res) => {
    const { 
        id_proveedor, 
        nombre_fiscal, 
        rif_juridico, 
        telefono_proveedor, 
        direccion_proveedor 
    } = req.body;

    if (!id_proveedor || !isNumeric(id_proveedor)) {
        return res.status(400).json({ 
            message: 'Se requiere un ID de Proveedor numérico para actualizar.' 
        });
    }

    const updateData = {};

    if (nombre_fiscal) updateData.nombre_fiscal = nombre_fiscal;
    if (direccion_proveedor) updateData.direccion_proveedor = direccion_proveedor;

    if (rif_juridico !== undefined) {
        if (!isNumeric(rif_juridico)) {
            return res.status(400).json({ 
                message: 'El RIF debe contener solo números.' 
            });
        }
        updateData.rif_juridico = String(rif_juridico);
    }

    if (telefono_proveedor !== undefined) {
        if (!isNumeric(telefono_proveedor)) {
            return res.status(400).json({ 
                message: 'El teléfono debe contener solo números.' 
            });
        }
        updateData.telefono_proveedor = String(telefono_proveedor);
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ 
            message: 'No se proporcionaron datos para actualizar.' 
        });
    }

    try {
        // Actualizar proveedor
        const [updatedRowsCount] = await Proveedor.update(updateData, {
            where: {
                id_proveedor: id_proveedor
            }
        });

        // Verificar si se encontró y actualizó el proveedor
        if (updatedRowsCount === 0) {
            return res.status(404).json({ 
                message: 'Proveedor no encontrado o no hubo cambios en los datos.' 
            });
        }

        // Obtener el proveedor actualizado
        const updatedProveedor = await Proveedor.findByPk(id_proveedor);

        res.status(200).json({ 
            message: 'Proveedor actualizado exitosamente.',
            proveedor: updatedProveedor
        });

    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({ 
            message: 'Error del servidor al actualizar.' 
        });
    }
};