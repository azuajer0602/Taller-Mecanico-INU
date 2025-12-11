import Vehiculo from '../models/Vehiculo.js';
import Marca from '../models/Marca.js';
import Cliente from '../models/Cliente.js';

export const vehiculoController = {
    
    // CREATE
    async create(req, res) {
        try {
            const { matricula, id_marca, modelo, afio, color, id_cliente } = req.body;

            if (!matricula || !id_marca || !id_cliente) {
                return res.status(400).json({
                    success: false,
                    message: 'Matrícula, Marca y Cliente son obligatorios'
                });
            }

            const nuevoVehiculo = await Vehiculo.create({
                matricula,
                id_marca, // Guardamos el ID
                modelo,
                afio,
                color,
                id_cliente,
                activo: true, // Por defecto true según requerimiento
                diagnosticado: false // Por defecto false según requerimiento
            });

            res.status(201).json({
                success: true,
                message: 'Vehículo registrado exitosamente',
                data: nuevoVehiculo
            });
        } catch (error) {
            console.error(error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ success: false, message: 'La matrícula ya existe' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // FIND ALL (Con relaciones para mostrar nombres en la tabla)
    async findAll(req, res) {
        try {
            const vehiculos = await Vehiculo.findAll({
                include: [
                    { model: Marca, as: 'marca_detalle', attributes: ['nombre_marca'] },
                    { model: Cliente, as: 'cliente_detalle', attributes: ['nombre', 'apellido', 'cedula'] }
                ],
                order: [['matricula', 'ASC']]
            });
            
            res.json({ success: true, count: vehiculos.length, data: vehiculos });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // FIND BY ID
    async findById(req, res) {
        try {
            const { matricula } = req.params;
            const vehiculo = await Vehiculo.findByPk(matricula, {
                 include: [
                    { model: Marca, as: 'marca_detalle' },
                    { model: Cliente, as: 'cliente_detalle' }
                ]
            });
            
            if (!vehiculo) return res.status(404).json({ success: false, message: 'Vehículo no encontrado' });
            
            res.json({ success: true, data: vehiculo });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // UPDATE
    async update(req, res) {
        try {
            const { matricula } = req.params;
            // Solo permitimos actualizar datos no clave
            const { id_marca, modelo, afio, color, id_cliente, activo } = req.body;

            const vehiculo = await Vehiculo.findByPk(matricula);
            if (!vehiculo) return res.status(404).json({ success: false, message: 'No encontrado' });

            if (id_marca !== undefined) vehiculo.id_marca = id_marca;
            if (modelo !== undefined) vehiculo.modelo = modelo;
            if (afio !== undefined) vehiculo.afio = afio;
            if (color !== undefined) vehiculo.color = color;
            if (id_cliente !== undefined) vehiculo.id_cliente = id_cliente;
            if (activo !== undefined) vehiculo.activo = activo;

            await vehiculo.save();

            res.json({ success: true, message: 'Actualizado correctamente', data: vehiculo });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // DELETE (Solo lógico o físico dependiendo de tu regla, aquí dejo el físico que tenías)
    async delete(req, res) {
        try {
            const { matricula } = req.params;
            const count = await Vehiculo.destroy({ where: { matricula } });
            
            if (count === 0) return res.status(404).json({ success: false, message: 'No encontrado' });
            
            res.json({ success: true, message: 'Vehículo eliminado' });
        } catch (error) {
             if (error.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(400).json({ success: false, message: 'No se puede eliminar, tiene registros asociados.' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }
};