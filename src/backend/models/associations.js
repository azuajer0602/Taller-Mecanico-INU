import CompraRepuesto from './CompraRepuesto.js';
import Repuesto from './Repuesto.js';
import Proveedor from './Proveedor.js';

// Definir relaciones
export const setupAsso = () => {
  // Una compra pertenece a un proveedor
  CompraRepuesto.belongsTo(Repuesto, { 
    foreignKey: 'id_repuesto', // Nombre de la columna clave foránea en CompraRepuesto
    as: 'repuesto' // Alias para la inclusión, ¡IMPORTANTE!
});

// Y probablemente también necesites la relación con Proveedor para que tus inclusiones en la UI funcionen:
CompraRepuesto.belongsTo(Proveedor, { 
    foreignKey: 'id_proveedor', // Nombre de la columna clave foránea en CompraRepuesto
    as: 'proveedor' // Alias para la inclusión, ¡IMPORTANTE!
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