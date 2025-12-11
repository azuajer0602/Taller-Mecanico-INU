import Servicio from '../models/Servicio.js';
import Vehiculo from '../models/Vehiculo.js';
import Marca from '../models/Marca.js';
import Cliente from '../models/Cliente.js';
import Falla from '../models/Falla.js';
import Empleado from '../models/Empleado.js';

export const servicioController = {
    
    // 1. Listar Servicios (Ahora trae datos reales de empleado)
    async findAll(req, res) {
        try {
            const servicios = await Servicio.findAll({
                include: [
                    { 
                        model: Vehiculo, as: 'vehiculo',
                        include: [
                             { model: Marca, as: 'marca_detalle' },
                             { model: Cliente, as: 'cliente_detalle' }
                        ]
                    },
                    { model: Falla, as: 'falla' },
                    { model: Empleado, as: 'mecanico', attributes: ['nombre_emp', 'apellido_emp'] }
                ],
                order: [['fecha_entrada', 'DESC']]
            });
            res.json({ success: true, data: servicios });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. Obtener Empleados (Mecánicos reales de la BD)
    async getMecanicos(req, res) {
        try {
            // Filtramos por cargo si es necesario, o traemos todos
            const mecanicos = await Empleado.findAll({
                where: { cargo: 'Mecánico' } // Ajusta este string según guardes en tu BD
            });
            res.json({ success: true, data: mecanicos });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3. Asignar Mecánico
    async asignar(req, res) {
        const { id } = req.params;
        const { id_empleado } = req.body;

        try {
            const servicio = await Servicio.findByPk(id);
            if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado' });

            servicio.id_empleado_fk = id_empleado;
            await servicio.save();
            res.json({ success: true, message: 'Mecánico asignado correctamente' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4. Cambiar Estado (Lógica de Mano de Obra)
    async cambiarEstado(req, res) {
        const { id } = req.params;
        const { nuevo_estado, mano_obra } = req.body; 
        // 1: Espera, 2: Reparación, 3: Reparado

        try {
            const servicio = await Servicio.findByPk(id);
            if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado' });

            // Lógica de transición
            if (nuevo_estado === 3) {
                // Si pasa a Reparado, guardamos la mano de obra y fecha salida
                servicio.mano_obra = mano_obra;
                servicio.fecha_salida = new Date();
                servicio.entrega = 'No entregado'; // Aún no se le da al cliente
            } else if (nuevo_estado === 2 && servicio.id_estado === 3) {
                // Si nos DEVOLVEMOS de Reparado a Reparación (hubo error), borramos mano de obra
                servicio.mano_obra = null;
                servicio.fecha_salida = null;
            }

            servicio.id_estado = nuevo_estado;
            await servicio.save();
            
            res.json({ success: true, message: 'Estado actualizado' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};