// Importación de todos los modelos del proyecto
import Cliente from './Cliente.js';
import Vehiculo from './Vehiculo.js';
import Diagnostico from './Diagnostico.js';
import Transaccion from './Transaccion.js';
import DetalleTransaccion from './DetalleTransaccion.js';
import TipoTransaccion from './TipoTransaccion.js';
import Factura from './Factura.js';
import ItemFactura from './ItemFactura.js';

const setupAssociations = () => {
  try {
    console.log('🔄 Configurando todas las asociaciones de modelos...');

    // === ASOCIACIONES DE CLIENTES Y VEHÍCULOS ===
    // Un Cliente puede tener muchos Vehículos
    Cliente.hasMany(Vehiculo, { foreignKey: 'id_cliente' });
    Vehiculo.belongsTo(Cliente, { foreignKey: 'id_cliente' });

    // Un Vehículo puede tener muchos Diagnósticos
    // La clave foránea 'id_vehiculo' en Diagnostico se refiere a la 'matricula' en Vehiculo
    Vehiculo.hasMany(Diagnostico, { foreignKey: 'id_vehiculo', sourceKey: 'matricula' });
    Diagnostico.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', targetKey: 'matricula' });

    // === ASOCIACIONES DE FACTURACIÓN ===
    // Un Cliente puede tener muchas Facturas
    Cliente.hasMany(Factura, { foreignKey: 'ClienteId' });
    Factura.belongsTo(Cliente, { foreignKey: 'ClienteId' });

    // Una Factura tiene muchos Items
    Factura.hasMany(ItemFactura, { foreignKey: 'FacturaId' });
    ItemFactura.belongsTo(Factura, { foreignKey: 'FacturaId' });

    // === ASOCIACIONES DE TRANSACCIONES CONTABLES ===
    // Una Transacción pertenece a un Tipo de Transacción
    Transaccion.belongsTo(TipoTransaccion, {
      foreignKey: 'id_tipo_transaccion_fk',
      targetKey: 'id_tipo_transaccion_pk', // <-- ¡SOLUCIÓN! Especificamos la columna de destino
      as: 'tipo_transaccion'
    });
    
    // Una Transacción tiene muchos Detalles
    Transaccion.hasMany(DetalleTransaccion, {
      foreignKey: 'id_transaccion', as: 'detalles'
    });
    
    console.log('✅ Todas las asociaciones han sido configuradas correctamente.');
  } catch (error) {
    console.error('❌ Error fatal al configurar las asociaciones:', error);
  }
};

export default setupAssociations;