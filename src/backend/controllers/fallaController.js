import Falla from '../models/Falla.js';
import Diagnostico from '../models/Diagnostico.js';
import Vehiculo from '../models/Vehiculo.js';

export const fallaController = {
    
    // 1. Obtener todas
    async findAll(req, res) {
        try {
            const fallas = await Falla.findAll({ order: [['nombre_falla', 'ASC']] });
            res.json({ success: true, data: fallas });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. Crear nueva
    async create(req, res) {
        try {
            const { nombre_falla } = req.body;
            if (!nombre_falla) return res.status(400).json({ message: 'El nombre es requerido' });

            const nueva = await Falla.create({ nombre_falla });
            res.status(201).json({ success: true, message: 'Falla registrada', data: nueva });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ success: false, message: 'Esta falla ya existe' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3. Actualizar (NUEVO MÉTODO)
    async update(req, res) {
        const { id } = req.params;
        const { nombre_falla } = req.body;

        if (!nombre_falla) return res.status(400).json({ message: 'El nombre es requerido' });

        try {
            const falla = await Falla.findByPk(id);
            if (!falla) return res.status(404).json({ success: false, message: 'Falla no encontrada' });

            // Actualizamos el nombre
            falla.nombre_falla = nombre_falla;
            await falla.save();

            res.json({ success: true, message: 'Falla actualizada correctamente', data: falla });

        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ success: false, message: 'Ya existe otra falla con ese nombre' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4. Eliminar (Con tu validación de seguridad)
    async delete(req, res) {
        const { id } = req.params;
        try {
            // Verificar si hay vehículos ACTIVOS usando esta falla
            const usosActivos = await Diagnostico.count({
                where: { id_falla: id },
                include: [{
                    model: Vehiculo,
                    as: 'vehiculo_detalle',
                    where: { activo: 1 } // Solo bloquea si el carro está en el taller
                }]
            });

            if (usosActivos > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No se puede eliminar: Hay vehículos ACTIVOS con esta falla.' 
                });
            }

            const resultado = await Falla.destroy({ where: { id_falla: id } });
            if (resultado === 0) return res.status(404).json({ success: false, message: 'No encontrada' });

            res.json({ success: true, message: 'Falla eliminada correctamente' });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};