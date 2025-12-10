import Cliente from './Cliente.js';
import Vehiculo from './Vehiculo.js';
import Diagnostico from './Diagnostico.js';
import Factura from './Factura.js';
import ItemFactura from './ItemFactura.js';

const setupAsso = () => {
  // Relación Cliente - Vehiculo
  Cliente.hasMany(Vehiculo, { foreignKey: 'id_cliente' });
  Vehiculo.belongsTo(Cliente, { foreignKey: 'id_cliente', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

  // Relación Vehiculo - Diagnostico
  Vehiculo.hasMany(Diagnostico, { foreignKey: 'id_vehiculo' });
  Diagnostico.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo' });

  // --- NUEVAS ASOCIACIONES DE FACTURACIÓN ---
  Cliente.hasMany(Factura, { foreignKey: 'ClienteId' });
  Factura.belongsTo(Cliente, { foreignKey: 'ClienteId', as: 'Cliente' });
  Factura.hasMany(ItemFactura, { foreignKey: 'FacturaId', as: 'ItemFacturas' });
  ItemFactura.belongsTo(Factura, { foreignKey: 'FacturaId' });
};

export default setupAsso;