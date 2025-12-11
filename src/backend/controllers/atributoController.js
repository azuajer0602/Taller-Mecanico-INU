import Atributo from '../models/Atributos.js';

export const atributoController = {
    
    // 1. Listar todos (Ordenados alfabéticamente)
    async findAll(req, res) {
        try {
            const atributos = await Atributo.findAll({ 
                order: [['nombre', 'ASC']] 
            });
            res.json({ success: true, data: atributos });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. Crear nuevo atributo
    async create(req, res) {
        try {
            const { nombre } = req.body;
            if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });

            const nuevo = await Atributo.create({ nombre });
            res.status(201).json({ success: true, message: 'Atributo registrado', data: nuevo });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ success: false, message: 'Este atributo ya existe en la lista.' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3. Actualizar
    async update(req, res) {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });

        try {
            const atributo = await Atributo.findByPk(id);
            if (!atributo) return res.status(404).json({ success: false, message: 'Atributo no encontrado' });

            atributo.nombre = nombre;
            await atributo.save();

            res.json({ success: true, message: 'Atributo actualizado correctamente', data: atributo });

        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ success: false, message: 'Ya existe otro atributo con ese nombre.' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4. Eliminar
    async delete(req, res) {
        const { id } = req.params;
        try {
            // Intentamos borrar. Si falla por FK (Foreign Key), el catch lo atrapa.
            const resultado = await Atributo.destroy({ where: { id_atributo: id } });
            
            if (resultado === 0) return res.status(404).json({ success: false, message: 'Atributo no encontrado' });

            res.json({ success: true, message: 'Atributo eliminado del catálogo' });

        } catch (error) {
            // Protección: Si este atributo ya se usó en un diagnóstico pasado, la BD no dejará borrarlo
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                 return res.status(400).json({ 
                    success: false, 
                    message: 'No se puede eliminar: Este item forma parte de diagnósticos históricos.' 
                });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }
};