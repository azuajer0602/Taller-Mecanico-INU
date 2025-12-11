import Servicio from '../models/Servicio.js';
import AtributoVehiculo from '../models/AtributoVehiculo.js';
import Vehiculo from '../models/Vehiculo.js';
import database from '../config/database.js';

const { sequelize } = database;

export const diagnosticoController = {
    
    // Guardar Diagnóstico Completo
    async registrar(req, res) {
        const t = await sequelize.transaction(); // Iniciar transacción

        try {
            const { matricula, id_falla, resultados_inspeccion } = req.body;

            // 1. Validaciones básicas
            if (!matricula || !id_falla || !resultados_inspeccion || resultados_inspeccion.length === 0) {
                throw new Error("Datos incompletos para el diagnóstico");
            }

            // 2. Crear el Servicio (Cabecera)
            const nuevoServicio = await Servicio.create({
                matricula_fk: matricula,
                id_falla_reportada: id_falla,
                id_empleado_fk: null,
                id_estado: 1, // 1 = Estado inicial (ej: "Ingresado")
                entrega: 'No entregado',
                fecha_entrada: new Date(),
                mano_obra: null
            }, { transaction: t });

            // 3. Preparar datos para AtributoVehiculo
            const atributosParaGuardar = resultados_inspeccion.map(item => ({
                matricula: matricula,
                id_atributo: item.id_atributo,
                id_estado_atributo: item.id_estado // 1, 2 o 3
            }));

            // 4. Guardar masivamente los atributos
            await AtributoVehiculo.bulkCreate(atributosParaGuardar, { transaction: t });

            // 5. Actualizar el vehículo a "Diagnosticado"
            await Vehiculo.update(
                { diagnosticado: 1 }, 
                { where: { matricula: matricula }, transaction: t }
            );

            // 6. Confirmar todo
            await t.commit();

            res.status(201).json({ 
                success: true, 
                message: 'Diagnóstico registrado exitosamente',
                id_servicio: nuevoServicio.id_servicio
            });

        } catch (error) {
            // Si algo falla, deshacer todo
            await t.rollback();
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};