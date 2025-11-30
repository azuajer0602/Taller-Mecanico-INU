import express from 'express';
import respuestas from '../../red/respuestas.js';
import db from '../config/database.js';
import Cliente from '../models/Cliente.js';
import Factura from '../models/Factura.js';
import ItemFactura from '../models/ItemFactura.js';

const router = express.Router();

// GET Todas las facturas
router.get('/', async (req, res) => {
    try {
        const facturas = await Factura.findAll({
            include: [
                {
                    model: Cliente,
                    attributes: ['nombre', 'apellido', 'cedula'] // Incluye solo estos campos del cliente
                },
                {
                    model: ItemFactura,
                    attributes: ['descripcion', 'cantidad', 'precio'] // Incluye los items
                }
            ],
            order: [['id', 'DESC']] // Ordena por ID descendente
        });
        // CORRECCIÓN: Pasar el array de facturas directamente.
        // El helper 'respuestas.success' se encargará de envolverlo en la propiedad 'data'.
        respuestas.success(req, res, facturas, 200);
    } catch (error) {
        console.error("Error al obtener facturas:", error);
        respuestas.error(req, res, 'Error interno del servidor', 500);
    }
});

// GET Una factura por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const factura = await Factura.findByPk(id, {
            include: [
                {
                    model: Cliente,
                    attributes: ['nombre', 'apellido', 'cedula', 'correo', 'telefono', 'direccion']
                },
                {
                    model: ItemFactura,
                    attributes: ['descripcion', 'cantidad', 'precio']
                }
            ]
        });

        if (!factura) return respuestas.error(req, res, 'Factura no encontrada', 404);

        respuestas.success(req, res, factura, 200);
    } catch (error) {
        respuestas.error(req, res, 'Error interno del servidor', 500, error);
    }
});

// POST Crear una nueva factura
router.post('/', async (req, res) => {
    const { cliente, factura, items } = req.body;
    const t = await db.sequelize.transaction(); // Iniciar transacción

    try {
        // 1. Buscar o crear el cliente
        let clienteExistente;
        if (cliente.id_cliente) {
            clienteExistente = await Cliente.findByPk(cliente.id_cliente);
        }
        
        if (!clienteExistente) {
            [clienteExistente] = await Cliente.findOrCreate({
                where: { cedula: cliente.cedula },
                defaults: {
                    nombre: cliente.nombre,
                    apellido: cliente.apellido,
                    correo: cliente.correo, // CORRECCIÓN: El modelo espera 'correo', no 'email'.
                    direccion: cliente.direccion,
                    telefono: cliente.telefono
                },
                transaction: t
            });
        }

        // 2. Crear la factura
        const nuevaFactura = await Factura.create({
            fechaPago: factura.fechaPago,
            total: factura.total,
            estado: factura.estado,
            metodoPago: factura.metodoPago,
            ClienteId: clienteExistente.id_cliente,
        }, { transaction: t });

        // 3. Crear los items de la factura
        const itemsParaCrear = items.map(item => ({
            ...item,
            FacturaId: nuevaFactura.id
        }));
        await ItemFactura.bulkCreate(itemsParaCrear, { transaction: t });

        // Si todo fue bien, confirmar la transacción
        await t.commit();

        // CORRECCIÓN DEFINITIVA: Pasar el objeto con el ID directamente.
        // El helper 'respuestas.success' lo envolverá en la propiedad 'data'.
        respuestas.success(req, res, { id: nuevaFactura.id }, 201);

    } catch (error) {
        // Si algo falla, revertir todo
        await t.rollback();
        console.error("Error al crear factura:", error);
        respuestas.error(req, res, 'Error al crear la factura', 500);
    }
});

// PATCH Actualizar estado de una factura (anular, pagar)
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const factura = await Factura.findByPk(id);
        if (!factura) {
            return respuestas.error(req, res, 'Factura no encontrada', 404);
        }
        factura.estado = estado;
        await factura.save();
        respuestas.success(req, res, { message: 'Estado actualizado' }, 200);
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        respuestas.error(req, res, 'Error al actualizar estado', 500);
    }
});

export default router;