import CompraRepuesto from './CompraRepuesto.js';
import Repuesto from './Repuesto.js';
import Proveedor from './Proveedor.js';

// Definir relaciones
export const setupAsso = () => {
  // Una compra pertenece a un proveedor
  CompraRepuesto.belongsTo(Proveedor, {
    foreignKey: 'id_proveedor',
    as: 'proveedor'
  });

  // Una compra pertenece a un repuesto
  CompraRepuesto.belongsTo(Repuesto, {
    foreignKey: 'id_repuesto',
    as: 'repuesto'
  });

  // Un proveedor tiene muchas compras
  Proveedor.hasMany(CompraRepuesto, {
    foreignKey: 'id_proveedor',
    as: 'compras'
  });

  // Un repuesto tiene muchas compras
  Repuesto.hasMany(CompraRepuesto, {
    foreignKey: 'id_repuesto',
    as: 'compras'
  });
};
export default setupAsso;