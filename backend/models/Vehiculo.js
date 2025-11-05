import pool from '../config/db.js';

export class Vehiculo {
    // CREATE - Crear nuevo vehículo
    static async create(vehiculoData) {
        const { matricula, marca, modelo, afio, color, id_cliente } = vehiculoData;
        
        // Verificar si la matrícula ya existe
        const vehiculoExistente = await this.findByMatricula(matricula);
        if (vehiculoExistente) {
            throw new Error('La matrícula ya está registrada');
        }

        const [result] = await pool.execute(
            'INSERT INTO vehiculo (matricula, marca, modelo, afio, color, id_cliente) VALUES (?, ?, ?, ?, ?, ?)',
            [matricula, marca, modelo, afio, color, id_cliente || null]
        );
        return matricula;
    }

    // READ - Obtener todos los vehículos
    static async findAll() {
        const [rows] = await pool.execute(`
            SELECT 
                v.matricula as id,
                v.marca,
                v.modelo, 
                v.afio as año,
                v.color,
                v.id_cliente,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido
            FROM vehiculo v
            LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
            ORDER BY v.marca, v.modelo
        `);
        return rows;
    }

    // READ - Obtener vehículo por matrícula
    static async findByMatricula(matricula) {
        const [rows] = await pool.execute(`
            SELECT 
                v.matricula as id,
                v.marca,
                v.modelo,
                v.afio as año,
                v.color,
                v.id_cliente,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido
            FROM vehiculo v
            LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
            WHERE v.matricula = ?
        `, [matricula]);
        return rows[0];
    }

    // UPDATE - Actualizar vehículo
    static async update(matricula, vehiculoData) {
        const { marca, modelo, afio, color, id_cliente } = vehiculoData;
        const [result] = await pool.execute(
            'UPDATE vehiculo SET marca = ?, modelo = ?, afio = ?, color = ?, id_cliente = ? WHERE matricula = ?',
            [marca, modelo, afio, color, id_cliente || null, matricula]
        );
        return result.affectedRows > 0;
    }

    // DELETE - Eliminar vehículo
    static async delete(matricula) {
        const [result] = await pool.execute('DELETE FROM vehiculo WHERE matricula = ?', [matricula]);
        return result.affectedRows > 0;
    }

    // Obtener vehículos disponibles para diagnóstico (sin diagnósticos activos)
    static async findVehiculosParaDiagnostico() {
        const [rows] = await pool.execute(`
            SELECT 
                v.matricula as id,
                v.marca,
                v.modelo,
                v.afio as año,
                v.color,
                CONCAT(v.marca, ' ', v.modelo, ' - ', v.matricula) as descripcion
            FROM vehiculo v
            WHERE v.matricula NOT IN (
                SELECT d.id_vehiculo 
                FROM diagnostico d 
                WHERE d.num_diagnostico IN (
                    SELECT odt.num_diagnostico 
                    FROM orden_de_trabajo odt 
                    WHERE odt.estado IN ('en_proceso', 'pendiente')
                )
            )
            ORDER BY v.marca, v.modelo
        `);
        return rows;
    }
}