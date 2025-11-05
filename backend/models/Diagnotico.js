import pool from '../config/db.js';

export class Diagnostico {
    // CREATE - Crear nuevo diagnóstico
    static async create(diagnosticoData) {
        const { id_vehiculo, descrip_falla, fecha_ingreso, sistemas } = diagnosticoData;
        
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Insertar diagnóstico principal
            const [result] = await connection.execute(
                'INSERT INTO diagnostico (id_vehiculo, descrip_falla, fecha_ingreso) VALUES (?, ?, ?)',
                [id_vehiculo, descrip_falla, fecha_ingreso || new Date()]
            );

            const num_diagnostico = result.insertId;

            // Aquí podrías insertar en tablas adicionales para los sistemas específicos
            // Por ahora guardamos todo en descrip_falla como JSON
            const diagnosticoCompleto = {
                num_diagnostico,
                id_vehiculo,
                fecha_ingreso: fecha_ingreso || new Date(),
                sistemas: sistemas
            };

            // Actualizar con los datos completos
            await connection.execute(
                'UPDATE diagnostico SET descrip_falla = ? WHERE num_diagnostico = ?',
                [JSON.stringify(diagnosticoCompleto), num_diagnostico]
            );

            await connection.commit();
            return num_diagnostico;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // READ - Obtener todos los diagnósticos
    static async findAll() {
        const [rows] = await pool.execute(`
            SELECT 
                d.num_diagnostico,
                d.id_vehiculo,
                d.fecha_ingreso,
                d.descrip_falla,
                v.marca,
                v.modelo,
                v.matricula,
                v.color,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido
            FROM diagnostico d
            LEFT JOIN vehiculo v ON d.id_vehiculo = v.matricula
            LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
            ORDER BY d.fecha_ingreso DESC
        `);

        // Parsear los sistemas del diagnóstico
        return rows.map(row => ({
            ...row,
            sistemas: row.descrip_falla ? JSON.parse(row.descrip_falla).sistemas : {}
        }));
    }

    // READ - Obtener diagnóstico por ID
    static async findById(num_diagnostico) {
        const [rows] = await pool.execute(`
            SELECT 
                d.num_diagnostico,
                d.id_vehiculo,
                d.fecha_ingreso,
                d.descrip_falla,
                v.marca,
                v.modelo,
                v.matricula,
                v.color
            FROM diagnostico d
            LEFT JOIN vehiculo v ON d.id_vehiculo = v.matricula
            WHERE d.num_diagnostico = ?
        `, [num_diagnostico]);

        if (rows.length === 0) return null;

        const row = rows[0];
        const diagnosticoCompleto = row.descrip_falla ? JSON.parse(row.descrip_falla) : {};

        return {
            num_diagnostico: row.num_diagnostico,
            id_vehiculo: row.id_vehiculo,
            fecha_ingreso: row.fecha_ingreso,
            vehiculo: {
                marca: row.marca,
                modelo: row.modelo,
                matricula: row.matricula,
                color: row.color
            },
            sistemas: diagnosticoCompleto.sistemas || {}
        };
    }

    // READ - Obtener diagnósticos por vehículo
    static async findByVehiculo(id_vehiculo) {
        const [rows] = await pool.execute(`
            SELECT 
                d.num_diagnostico,
                d.id_vehiculo,
                d.fecha_ingreso,
                d.descrip_falla
            FROM diagnostico d
            WHERE d.id_vehiculo = ?
            ORDER BY d.fecha_ingreso DESC
        `, [id_vehiculo]);

        return rows.map(row => ({
            ...row,
            sistemas: row.descrip_falla ? JSON.parse(row.descrip_falla).sistemas : {}
        }));
    }

    // UPDATE - Actualizar diagnóstico
    static async update(num_diagnostico, diagnosticoData) {
        const { descrip_falla, sistemas } = diagnosticoData;
        
        const diagnosticoCompleto = {
            num_diagnostico,
            sistemas: sistemas
        };

        const [result] = await pool.execute(
            'UPDATE diagnostico SET descrip_falla = ? WHERE num_diagnostico = ?',
            [JSON.stringify(diagnosticoCompleto), num_diagnostico]
        );

        return result.affectedRows > 0;
    }

    // DELETE - Eliminar diagnóstico
    static async delete(num_diagnostico) {
        const [result] = await pool.execute('DELETE FROM diagnostico WHERE num_diagnostico = ?', [num_diagnostico]);
        return result.affectedRows > 0;
    }
}