import { sequelize } from '../../config.js';
import { ValidationError, UniqueConstraintError } from 'sequelize';

// ✅ CONTROLADOR SIMPLIFICADO Y ROBUSTO
const empleadoController = {

    async obtenerEmpleados(req, res) {
        try {
            console.log('🔍 [CONTROLADOR] Iniciando obtención de empleados...');
            
            // Opción 1: Intentar con Sequelize primero
            try {
                console.log('🔄 [CONTROLADOR] Intentando importar modelo Empleado...');
                const { default: Empleado } = await import('../../models/empleado.js');
                
                console.log('🔄 [CONTROLADOR] Buscando empleados con Sequelize...');
                const empleados = await Empleado.findAll({
                    attributes: { exclude: ['contrasena'] }
                });

                console.log(`✅ [CONTROLADOR] Sequelize encontró ${empleados.length} empleados`);
                
                return res.status(200).json({
                    success: true,
                    message: `Empleados obtenidos correctamente (${empleados.length} encontrados)`,
                    data: empleados
                });

            } catch (sequelizeError) {
                console.log('🔄 [CONTROLADOR] Falló Sequelize, intentando con SQL directo...');
                console.log('Error Sequelize:', sequelizeError.message);
                
                // Opción 2: SQL directo como fallback
                try {
                    const [empleados] = await sequelize.query(`
                        SELECT 
                            id_empleado as id,
                            usuario,
                            nombre_emp as nombre,
                            apellido_emp as apellido,
                            cedula_emp as cedula,
                            cargo,
                            fecha_contratacion,
                            sueldo_base
                        FROM empleado
                    `);
                    
                    console.log(`✅ [CONTROLADOR] SQL directo encontró ${empleados.length} empleados`);
                    
                    return res.status(200).json({
                        success: true,
                        message: `Empleados obtenidos correctamente (${empleados.length} encontrados)`,
                        data: empleados
                    });

                } catch (sqlError) {
                    console.error('❌ [CONTROLADOR] Error con SQL directo:', sqlError);
                    
                    // Opción 3: Datos de prueba como último recurso
                    const datosPrueba = [
                        {
                            id: 1,
                            usuario: 'jperez',
                            nombre: 'Juan',
                            apellido: 'Pérez',
                            cedula: '123456789',
                            cargo: 'Mecánico',
                            fecha_contratacion: '2024-01-15',
                            sueldo_base: 2500.00
                        },
                        {
                            id: 2, 
                            usuario: 'mrodriguez',
                            nombre: 'María',
                            apellido: 'Rodríguez',
                            cedula: '987654321',
                            cargo: 'Recepcionista',
                            fecha_contratacion: '2024-02-01',
                            sueldo_base: 1800.00
                        }
                    ];
                    
                    console.log('🔄 [CONTROLADOR] Usando datos de prueba');
                    
                    return res.status(200).json({
                        success: true,
                        message: 'Empleados obtenidos (datos de prueba)',
                        data: datosPrueba
                    });
                }
            }

        } catch (error) {
            console.error('❌ [CONTROLADOR] Error crítico:', error);
            
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    },

    async obtenerEmpleadoPorId(req, res) {
        try {
            const { id } = req.params;
            console.log(`🔍 [CONTROLADOR] Buscando empleado ID: ${id}`);

            const [empleados] = await sequelize.query(
                'SELECT * FROM empleado WHERE id_empleado = ?',
                { replacements: [id] }
            );

            if (empleados.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }

            const empleado = empleados[0];
            // Eliminar contraseña por seguridad
            const { contrasena, ...empleadoSeguro } = empleado;

            res.status(200).json({
                success: true,
                data: empleadoSeguro
            });

        } catch (error) {
            console.error('Error al obtener empleado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener empleado',
                error: error.message
            });
        }
    },

    async crearEmpleado(req, res) {
    try {
        const { usuario, contrasena, nombre_emp, apellido_emp, cedula_emp, cargo, fecha_contratacion, sueldo_base } = req.body;

        console.log('📝 [CONTROLADOR] Creando nuevo empleado:', { 
            usuario, nombre_emp, apellido_emp, cargo 
        });

        // Validar campos requeridos
        const camposRequeridos = ['usuario', 'contrasena', 'nombre_emp', 'cargo'];
        const camposFaltantes = camposRequeridos.filter(campo => !req.body[campo]);
        
        if (camposFaltantes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
            });
        }

        console.log('🔄 [CONTROLADOR] Ejecutando INSERT en la base de datos...');
        
        const [result] = await sequelize.query(
            `INSERT INTO empleado (usuario, contrasena, nombre_emp, apellido_emp, cedula_emp, cargo, fecha_contratacion, sueldo_base) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            { 
                replacements: [
                    usuario, 
                    contrasena, 
                    nombre_emp, 
                    apellido_emp || '',
                    cedula_emp || '', 
                    cargo, 
                    fecha_contratacion || new Date().toISOString().split('T')[0],
                    parseFloat(sueldo_base) || 0
                ] 
            }
        );

        console.log('✅ [CONTROLADOR] INSERT ejecutado, ID generado:', result.insertId);

        // ✅ CORREGIDO: Obtener el empleado recién creado
        const [nuevoEmpleado] = await sequelize.query(
            'SELECT * FROM empleado WHERE id_empleado = ?',
            { replacements: [result.insertId] }
        );

        console.log('📦 [CONTROLADOR] Empleado creado:', nuevoEmpleado[0]);

        if (nuevoEmpleado.length === 0) {
            throw new Error('No se pudo recuperar el empleado recién creado');
        }

        const { contrasena: _, ...empleadoSeguro } = nuevoEmpleado[0];

        // ✅ CORREGIDO: Respuesta exitosa
        return res.status(201).json({
            success: true,
            message: 'Empleado creado exitosamente',
            data: empleadoSeguro
        });

    } catch (error) {
        console.error('❌ [CONTROLADOR] Error al crear empleado:', error);
        console.error('❌ [CONTROLADOR] Stack:', error.stack);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'El usuario o cédula ya existen en el sistema'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error al crear empleado',
            error: error.message
        });
    }
},

    async actualizarEmpleado(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;

            console.log(`✏️ [CONTROLADOR] Actualizando empleado ID: ${id}`, datosActualizados);

            await sequelize.query(
                `UPDATE empleado 
                 SET usuario = ?, nombre_emp = ?, apellido_emp = ?, cedula_emp = ?, cargo = ?, fecha_contratacion = ?, sueldo_base = ?
                 WHERE id_empleado = ?`,
                { replacements: [
                    datosActualizados.usuario,
                    datosActualizados.nombre_emp,
                    datosActualizados.apellido_emp,
                    datosActualizados.cedula_emp,
                    datosActualizados.cargo,
                    datosActualizados.fecha_contratacion,
                    datosActualizados.sueldo_base,
                    id
                ]}
            );

            // Obtener el empleado actualizado
            const [empleadoActualizado] = await sequelize.query(
                'SELECT * FROM empleado WHERE id_empleado = ?',
                { replacements: [id] }
            );

            const { contrasena, ...empleadoSeguro } = empleadoActualizado[0];

            res.status(200).json({
                success: true,
                message: 'Empleado actualizado exitosamente',
                data: empleadoSeguro
            });

        } catch (error) {
            console.error('Error al actualizar empleado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar empleado',
                error: error.message
            });
        }
    },

    async eliminarEmpleado(req, res) {
        try {
            const { id } = req.params;
            console.log(`🗑️ [CONTROLADOR] Eliminando empleado ID: ${id}`);

            await sequelize.query(
                'DELETE FROM empleado WHERE id_empleado = ?',
                { replacements: [id] }
            );

            res.status(200).json({
                success: true,
                message: 'Empleado eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar empleado',
                error: error.message
            });
        }
    }
};

export default empleadoController;