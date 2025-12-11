import database from '../config/database.js';
import { Op } from 'sequelize';
const { sequelize } = database;

// Modelos
import Vehiculo from '../models/Vehiculo.js';
import Servicio from '../models/Servicio.js';
import Factura from '../models/Factura.js';
import Empleado from '../models/Empleado.js';
import Cliente from '../models/Cliente.js';
import Marca from '../models/Marca.js';
import Falla from '../models/Falla.js';

export const dashboardController = {

    async getResumen(req, res) {
        try {
            const hoy = new Date();
            const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
            const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

            // 1. MÉTRICAS (Cards Superiores)
            
            // A. Vehículos Reparados (Histórico)
            const vehiculosReparados = await Servicio.count({
                where: { id_estado: 3 } // 3 = Listo/Completado
            });

            // B. Vehículos este mes (Entradas)
            const vehiculosEsteMes = await Servicio.count({
                where: {
                    fecha_entrada: { [Op.gte]: primerDiaMes }
                }
            });

            // C. Mecánicos
            const totalMecanicos = await Empleado.count({
                where: { cargo: 'Mecánico' } // Ajusta si tu cargo se escribe diferente
            });
            
            // Mecánicos activos (los que tienen al menos un servicio en estado 2)
            const mecanicosActivos = await Servicio.count({
                distinct: true,
                col: 'id_empleado_fk',
                where: { id_estado: 2 }
            });

            // D. Ingresos (Facturas Pagadas)
            const ingresosMes = await Factura.sum('total', {
                where: {
                    estado: 'Pagado',
                    fechaPago: { [Op.gte]: primerDiaMes }
                }
            }) || 0;

            const ingresosMesAnterior = await Factura.sum('total', {
                where: {
                    estado: 'Pagado',
                    fechaPago: { 
                        [Op.between]: [primerDiaMesAnterior, ultimoDiaMesAnterior] 
                    }
                }
            }) || 0;

            // E. Servicios Activos (En taller actualmente)
            const serviciosActivos = await Servicio.count({
                where: { id_estado: 2 } // 2 = En Reparación
            });

            // 2. LISTAS (Tablas)

            // A. Vehículos Recientes (Últimos 5 ingresados)
            const vehiculosRecientes = await Servicio.findAll({
                limit: 5,
                order: [['fecha_entrada', 'DESC']],
                include: [
                    { 
                        model: Vehiculo, as: 'vehiculo',
                        include: [
                            { model: Marca, as: 'marca_detalle' },
                            { model: Cliente, as: 'cliente_detalle' }
                        ]
                    }
                ]
            });

            // B. Servicios Recientes (Últimos 5 completados o en proceso)
            const serviciosRecientes = await Servicio.findAll({
                limit: 5,
                order: [['id_servicio', 'DESC']], // Los últimos creados
                include: [
                    { 
                        model: Vehiculo, as: 'vehiculo',
                        include: [{ model: Marca, as: 'marca_detalle' }]
                    },
                    { model: Empleado, as: 'mecanico' },
                    { model: Falla, as: 'falla' }
                ]
            });

            // RESPUESTA COMPLETA
            res.json({
                success: true,
                data: {
                    metrics: {
                        vehiculosReparados,
                        vehiculosEsteMes,
                        mecanicos: totalMecanicos,
                        mecanicosActivos,
                        ingresosMes,
                        ingresosMesAnterior,
                        serviciosActivos
                    },
                    listas: {
                        vehiculos: vehiculosRecientes,
                        servicios: serviciosRecientes
                    }
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};