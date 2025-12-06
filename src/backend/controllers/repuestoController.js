
import Repuesto from '../models/Repuesto.js';
import { Op } from 'sequelize';

const isNumeric = (value) => {
    if (value === null || value === undefined) return false;
    const strValue = String(value);
    return /^\d+(\.\d+)?$/.test(strValue) && !isNaN(parseFloat(strValue));
};


//obtener todos los proveedores
export const obtenerRepuestos = async (req , res) => {
    try {
        const repuestos = await Repuesto.findAll({
            attributes: { exclude: [''] } 
        });

        if (repuestos.length === 0) {
            return res.status(404).json({ message: 'No hay Repuestos registrados.' });
        }

        res.status(200).json({
            message: 'Lista de Repuestos obtenida exitosamente.',
            repuestos: repuestos
        });

    } catch (error) {
        console.error('Error al obtener todos los Repuestos:', error);
        res.status(500).json({ message: 'Error del servidor al obtener Repuestos.' });
    }
};
//modulo de registro
export const repuestoRegistro = async (req, res) => {
    
    const { id_repuesto, nombre_repuesto, desc_repuesto, precio_unitario, stock_inventario } = req.body; 

    if (!id_repuesto || !nombre_repuesto || !desc_repuesto || !precio_unitario || !stock_inventario ) {
      return res.status(400).json({ message: 'Se requiere llenar todos los campos.' });
    }

    if (!isNumeric(precio_unitario)) {
        return res.status(400).json({ message: 'El precio debe contener solo números.' });
    }

    if (!isNumeric(stock_inventario)) {
        return res.status(400).json({ message: 'El stock debe contener solo números.' });
    }

    try {
        const existingRepuesto = await Repuesto.findOne({
        where: {
            [Op.or]: [
                { id_repuesto: id_repuesto },
                { nombre_repuesto: nombre_repuesto }
            ]
        }
    });


        if (existingRepuesto) {
            return res.status(409).json({ message: 'El ID o el nombre ya está en uso.' });}


        const newRepuesto = await Repuesto.create({ 
            id_repuesto: id_repuesto, 
            nombre_repuesto: nombre_repuesto, 
            desc_repuesto: desc_repuesto, 
            precio_unitario: precio_unitario, 
            stock_inventario: stock_inventario
        });

        res.status(201).json({ 
            message: 'Repuesto registrado exitosamente', 
            repuesto: { 
                id_repuesto: newRepuesto.id_repuesto, 
                nombre_repuesto: newRepuesto.nombre_repuesto 
            } 
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor al registrar.' });
    }
};


//modulo de eliminacion de empleados

export const deleteRepuesto = async (req, res) => {

    const { id_repuesto } = req.body;

    if (!id_repuesto || !isNumeric(id_repuesto)) {
        return res.status(400).json({ message: 'Se requiere un ID de repuesto numérico en el cuerpo de la solicitud.' });
    }

    try {
        const count = await Repuesto.destroy({
            where: {
                id_repuesto: id_repuesto
            }
        });

        if (count === 0) {
            return res.status(404).json({ message: 'Repuesto no encontrado.' });
        }

        res.status(200).json({ message: 'Repuesto eliminado exitosamente.' });

    } catch (error) {
        console.error('Error al eliminar Repuesto:', error);
        res.status(500).json({ message: 'Error del servidor al eliminar.' });
    }
};


export const updatedRepuesto = async (req, res) => {
    const { 
        id_repuesto, nombre_repuesto, desc_repuesto, precio_unitario, stock_inventario 
    } = req.body;

    if (!id_repuesto || !isNumeric(id_repuesto)) {
        return res.status(400).json({ 
            message: 'Se requiere un ID de Repuesto numérico para actualizar.' 
        });
    }

    const updateData = {};

    if (nombre_repuesto) updateData.nombre_repuesto = nombre_repuesto;
    if (desc_repuesto) updateData.desc_repuesto = desc_repuesto;

    if (precio_unitario !== undefined) {
        if (!isNumeric(precio_unitario)) {
            return res.status(400).json({ 
                message: 'El precio debe contener solo números.' 
            });
        }
        updateData.precio_unitario = String(precio_unitario);
    }

    if (stock_inventario !== undefined) {
        if (!isNumeric(stock_inventario)) {
            return res.status(400).json({ 
                message: 'El Stock debe contener solo números.' 
            });
        }
        updateData.stock_inventario = String(stock_inventario);
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ 
            message: 'No se proporcionaron datos para actualizar.' 
        });
    }

    try {
        // Actualizar proveedor
        const [updatedRowsCount] = await Repuesto.update(updateData, {
            where: {
                id_repuesto: id_repuesto
            }
        });

        // Verificar si se encontró y actualizó el proveedor
        if (updatedRowsCount === 0) {
            return res.status(404).json({ 
                message: 'Repuesto no encontrado o no hubo cambios en los datos.' 
            });
        }

        // Obtener el proveedor actualizado
        const updatedRepuesto = await Repuesto.findByPk(id_repuesto);

        res.status(200).json({ 
            message: 'Repuesto actualizado exitosamente.',
            repuesto: updatedRepuesto
        });

    } catch (error) {
        console.error('Error al actualizar Repuesto:', error);
        res.status(500).json({ 
            message: 'Error del servidor al actualizar.' 
        });
    }
};