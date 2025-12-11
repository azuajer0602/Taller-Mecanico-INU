import database from '../config/database.js';
import { Op } from 'sequelize';
const { sequelize } = database;

// Importamos Modelos
import Factura from '../models/Factura.js';
import ItemFactura from '../models/ItemFactura.js';
import Cliente from '../models/Cliente.js';
import Servicio from '../models/Servicio.js';   
import Empleado from '../models/Empleado.js';   

export const reportesController = {

    // 1. VOLUMEN DE VENTAS (Por Producto/Servicio)
    async ventasPorProducto(req, res) {
        try {
            const productos = await ItemFactura.findAll({
                attributes: [
                    'descripcion',
                    [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido'],
                    [sequelize.fn('SUM', sequelize.literal('cantidad * precio')), 'ingreso_total']
                ],
                group: ['descripcion'],
                order: [[sequelize.literal('total_vendido'), 'DESC']],
                limit: 5
            });
            res.json({ success: true, data: productos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 2. VENTAS POR CLIENTE (Mejores Clientes)
    async ventasPorCliente(req, res) {
        try {
            const clientes = await Factura.findAll({
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('total')), 'total_comprado'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad_facturas']
                ],
                include: [{
                    model: Cliente,
                    as: 'Cliente',
                    // --- AQUÍ ESTÁ EL CAMBIO: AGREGAMOS 'direccion' ---
                    attributes: ['nombre', 'apellido', 'cedula', 'telefono', 'correo', 'direccion']
                }],
                group: ['Cliente.id_cliente'],
                order: [[sequelize.literal('total_comprado'), 'DESC']],
                limit: 10 
            });
            res.json({ success: true, data: clientes });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 3. TENDENCIAS (Ventas por Mes)
    async tendenciasVentas(req, res) {
        try {
            const tendencias = await Factura.findAll({
                attributes: [
                    [sequelize.fn('DATE_FORMAT', sequelize.col('fechaPago'), '%Y-%m'), 'mes'],
                    [sequelize.fn('SUM', sequelize.col('total')), 'total_venta']
                ],
                where: { estado: 'Pagado' }, 
                group: [sequelize.fn('DATE_FORMAT', sequelize.col('fechaPago'), '%Y-%m')],
                order: [[sequelize.fn('DATE_FORMAT', sequelize.col('fechaPago'), '%Y-%m'), 'ASC']],
                limit: 12 
            });
            
            res.json({ success: true, data: tendencias });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async desempenoMecanicos(req, res) {
        try {
            // Buscamos todos los servicios que tengan mecánico asignado
            const servicios = await Servicio.findAll({
                where: { 
                    id_empleado_fk: { [Op.ne]: null } // Que no sea null
                },
                include: [{
                    model: Empleado,
                    as: 'mecanico',
                    attributes: ['id_empleado', 'nombre_emp', 'apellido_emp']
                }]
            });

            // Procesamos los datos en memoria para calcular KPIs
            const stats = {};

            servicios.forEach(s => {
                const id = s.mecanico.id_empleado;
                const nombre = `${s.mecanico.nombre_emp} ${s.mecanico.apellido_emp}`;

                if (!stats[id]) {
                    stats[id] = {
                        nombre,
                        asignados: 0,
                        completados: 0,
                        ingresos_mano_obra: 0,
                        dias_totales: 0, // Para calcular promedio
                        servicios_con_tiempo: 0
                    };
                }

                stats[id].asignados++;

                // Si está completado (Estado 3)
                if (s.id_estado === 3) {
                    stats[id].completados++;
                    stats[id].ingresos_mano_obra += parseFloat(s.mano_obra || 0);

                    // Calcular tiempo de reparación (Eficiencia)
                    if (s.fecha_entrada && s.fecha_salida) {
                        const entrada = new Date(s.fecha_entrada);
                        const salida = new Date(s.fecha_salida);
                        const diffTime = Math.abs(salida - entrada);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                        stats[id].dias_totales += diffDays;
                        stats[id].servicios_con_tiempo++;
                    }
                }
            });

            // Formatear resultado final
            const reporte = Object.values(stats).map(m => ({
                mecanico: m.nombre,
                total_servicios: m.completados, // KPI Productividad
                tasa_cumplimiento: m.asignados > 0 ? ((m.completados / m.asignados) * 100).toFixed(1) : 0,
                ingreso_generado: m.ingresos_mano_obra, // KPI Rentabilidad
                tiempo_promedio: m.servicios_con_tiempo > 0 ? (m.dias_totales / m.servicios_con_tiempo).toFixed(1) : 0 // KPI Eficiencia
            }));

            // Ordenar por quién ha generado más dinero (o por servicios completados)
            reporte.sort((a, b) => b.ingreso_generado - a.ingreso_generado);

            res.json({ success: true, data: reporte });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
