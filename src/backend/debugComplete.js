import { sequelize } from './config.js';
import Empleado from './models/empleado.js';

async function debugComplete() {
    try {
        console.log('1. 🔌 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        console.log('2. 🔍 Verificando estructura de la tabla...');
        const [tables] = await sequelize.query("SHOW TABLES LIKE 'empleado'");
        console.log('📋 Tabla empleado existe:', tables.length > 0);

        if (tables.length > 0) {
            console.log('3. 📊 Consultando estructura de la tabla...');
            const [columns] = await sequelize.query('DESCRIBE empleado');
            console.log('🏗️ Estructura de la tabla:');
            columns.forEach(col => {
                console.log(`   - ${col.Field}: ${col.Type} (${col.Key})`);
            });

            console.log('4. 🔎 Consultando datos con SQL directo...');
            const [empleadosSQL] = await sequelize.query('SELECT * FROM empleado');
            console.log(`📊 Empleados en BD: ${empleadosSQL.length}`);
            empleadosSQL.forEach((emp, index) => {
                console.log(`   ${index + 1}. ${emp.usuario} - ${emp.nombre_emp} ${emp.apellido_emp}`);
            });

            console.log('5. 🔄 Probando consulta con Sequelize...');
            const empleadosSequelize = await Empleado.findAll();
            console.log(`📊 Empleados con Sequelize: ${empleadosSequelize.length}`);

            if (empleadosSequelize.length > 0) {
                console.log('📋 Primer empleado con Sequelize:');
                console.log(JSON.stringify(empleadosSequelize[0].toJSON(), null, 2));
            }
        }

    } catch (error) {
        console.error('❌ Error en debug:', error.message);
        console.error('❌ Stack:', error.stack);
    } finally {
        await sequelize.close();
        console.log('🔚 Conexión cerrada');
    }
}

debugComplete();