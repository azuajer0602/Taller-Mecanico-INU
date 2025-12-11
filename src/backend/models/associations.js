import Cliente from './Cliente.js';
import Vehiculo from './Vehiculo.js';
import Diagnostico from './Diagnostico.js';
import Factura from './Factura.js';
import ItemFactura from './ItemFactura.js';
import Marca from './Marca.js';
// Importa los modelos de inventario
import Repuesto from './Repuesto.js';
import CompraRepuesto from './CompraRepuesto.js';
import Proveedor from './Proveedor.js'; // <--- ¡Asegúrate de importar Proveedor!
import Falla from './Falla.js';
import Atributo from './Atributos.js';
import Servicio from './Servicio.js';
import AtributoVehiculo from './AtributoVehiculo.js';
import Empleado from './Empleado.js';
const setupAsso = () => {

  // --- ASOCIACIONES DE FACTURACIÓN ---
  Cliente.hasMany(Factura, { foreignKey: 'ClienteId' });
  Factura.belongsTo(Cliente, { foreignKey: 'ClienteId', as: 'Cliente' });
  Factura.hasMany(ItemFactura, { foreignKey: 'FacturaId', as: 'ItemFacturas' });
  ItemFactura.belongsTo(Factura, { foreignKey: 'FacturaId' });

  // --- ASOCIACIONES DE INVENTARIO / COMPRAS ---
  
  // 1. Relación Compra - Repuesto
  CompraRepuesto.belongsTo(Repuesto, { 
      foreignKey: 'id_repuesto',
      as: 'repuesto' // <--- COINCIDE con tu controlador
  });

  Repuesto.hasMany(CompraRepuesto, { 
      foreignKey: 'id_repuesto'
  });

  // 2. Relación Compra - Proveedor
  CompraRepuesto.belongsTo(Proveedor, { 
      foreignKey: 'id_proveedor',
      as: 'proveedor' // <--- COINCIDE con tu controlador
  });

  Proveedor.hasMany(CompraRepuesto, { 
      foreignKey: 'id_proveedor' 
  });
  
  // 1. Vehiculo pertenece a una Marca
  Vehiculo.belongsTo(Marca, { foreignKey: 'id_marca', as: 'marca_detalle' });
  Marca.hasMany(Vehiculo, { foreignKey: 'id_marca' });

  // 2. Vehiculo pertenece a un Cliente
  Vehiculo.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente_detalle' });
  Cliente.hasMany(Vehiculo, { foreignKey: 'id_cliente' });

  // Diagnostico tiene una Falla
Diagnostico.belongsTo(Falla, { foreignKey: 'id_falla', as: 'falla_detalle' });
Falla.hasMany(Diagnostico, { foreignKey: 'id_falla' });

// Diagnostico tiene un Vehiculo (Esto ya deberías tenerlo, pero verifica el alias)
Diagnostico.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculo_detalle' });
};

// ASOCIACIONES DE SERVICIO
Servicio.belongsTo(Vehiculo, { foreignKey: 'matricula_fk', targetKey: 'matricula', as: 'vehiculo' });
Vehiculo.hasMany(Servicio, { foreignKey: 'matricula_fk' });

Servicio.belongsTo(Falla, { foreignKey: 'id_falla_reportada', as: 'falla' });

// ASOCIACIONES DE ATRIBUTO_VEHICULO (Checklist)
AtributoVehiculo.belongsTo(Vehiculo, { foreignKey: 'matricula', targetKey: 'matricula' });
AtributoVehiculo.belongsTo(Atributo, { foreignKey: 'id_atributo' });

Servicio.belongsTo(Empleado, { foreignKey: 'id_empleado_fk', as: 'mecanico' });
Empleado.hasMany(Servicio, { foreignKey: 'id_empleado_fk' });

export default setupAsso;