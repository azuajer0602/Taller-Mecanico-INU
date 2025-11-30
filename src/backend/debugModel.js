import { sequelize } from './config.js';
import Empleado from './models/empleado.js';

async function debugModel() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a BD establecida');

        // Probar consulta directa con SQL
        const [result] = await sequelize.query('SELECT * FROM empleado LIMIT 1');
        console.log('📋 Datos reales en BD:', result[0]);

        // Probar consulta con Sequelize
        const empleados = await Empleado.findAll();
        console.log(`✅ Empleados encontrados con Sequelize: ${empleados.length}`);
        
        if (empleados.length > 0) {
            console.log('📋 Primer empleado con Sequelize:', empleados[0].toJSON());
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('❌ Stack:', error.stack);
    } finally {
        await sequelize.close();
    }
}

debugModel();