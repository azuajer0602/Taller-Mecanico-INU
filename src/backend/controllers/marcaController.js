import Marca from '../models/Marca.js';

export const marcaController = {
    // Obtener todas
    async findAll(req, res) {
        try {
            const marcas = await Marca.findAll({ order: [['nombre_marca', 'ASC']] });
            res.json({ success: true, data: marcas });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Crear
    async create(req, res) {
        try {
            const { nombre_marca } = req.body;
            if (!nombre_marca) return res.status(400).json({ message: 'Nombre requerido' });
            
            const nueva = await Marca.create({ nombre_marca });
            res.status(201).json({ success: true, data: nueva, message: 'Marca creada' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Actualizar
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre_marca } = req.body;
            await Marca.update({ nombre_marca }, { where: { id_marca: id } });
            res.json({ success: true, message: 'Marca actualizada' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Eliminar
    async delete(req, res) {
        try {
            const { id } = req.params;
            //Validacion por si hay vehiculos asociados con esa marca
            await Marca.destroy({ where: { id_marca: id } });
            res.json({ success: true, message: 'Marca eliminada' });
        } catch (error) {
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(400).json({ success: false, message: 'No se puede eliminar: Hay vehículos de esta marca.' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }
};