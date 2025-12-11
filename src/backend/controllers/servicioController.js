import Servicio from '../models/Servicio.js';
import Vehiculo from '../models/Vehiculo.js';
import Marca from '../models/Marca.js';
import Cliente from '../models/Cliente.js';
import Falla from '../models/Falla.js';
import Empleado from '../models/Empleado.js';

export const servicioController = {
    
    // 1. Listar Servicios
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
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. Obtener lista de Mecánicos
    async getMecanicos(req, res) {
        try {
            const mecanicos = await Empleado.findAll({
                where: { cargo: 'Mecánico' } 
            });
            res.json({ success: true, data: mecanicos });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3. Asignar Mecánico (Admin)
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

    // 4. Cambiar Estado (USO DEL MECÁNICO)
    // Lógica: Solo mueve id_estado y mano_obra. NO TOCA fecha_salida.
    async cambiarEstado(req, res) {
        const { id } = req.params;
        const { nuevo_estado, mano_obra } = req.body; 
        
        try {
            const servicio = await Servicio.findByPk(id);
            if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado' });

            const estadoActual = servicio.id_estado;

            // Transición: En Reparación (2) -> Listo (3)
            if (estadoActual === 2 && nuevo_estado === 3) {
                if (!mano_obra || mano_obra <= 0) {
                    return res.status(400).json({ message: 'Se requiere el costo de mano de obra.' });
                }
                servicio.id_estado = 3;
                servicio.mano_obra = mano_obra; 
                // NO se toca fecha_salida ni entrega aquí
            } 
            // Transición: Listo (3) -> En Reparación (2) (Reverso por corrección)
            else if (estadoActual === 3 && nuevo_estado === 2) {
                servicio.id_estado = 2;
                servicio.mano_obra = null; // Se limpia la mano de obra
            }
            // Transición: Pendiente (1) -> En Reparación (2)
            else if (estadoActual === 1 && nuevo_estado === 2) {
                servicio.id_estado = 2;
            }
            else {
                // Permitir actualización simple si no viola reglas lógicas
                servicio.id_estado = nuevo_estado;
            }

            await servicio.save();
            res.json({ success: true, message: 'Estado actualizado correctamente' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 5. Entregar / Facturar (USO DE ADMINISTRACIÓN)
    // Lógica: Cierra el ciclo, marca como entregado y PONE LA FECHA DE SALIDA.
    async entregar(req, res) {
        const { id } = req.params;
        try {
            const servicio = await Servicio.findByPk(id);
            if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado' });

            if (servicio.id_estado !== 3) {
                return res.status(400).json({ message: 'El vehículo debe estar reparado (Listo) para poder entregarlo.' });
            }

            servicio.entrega = 'Entregado';
            servicio.fecha_salida = new Date(); // <--- AQUÍ ES DONDE SE GUARDA LA FECHA
            
            await servicio.save();
            res.json({ success: true, message: 'Vehículo entregado y fecha de salida registrada.' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};