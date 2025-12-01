import Transaccion from './Transaccion.js';
import DetalleTransaccion from './DetalleTransaccion.js';
import TipoTransaccion from './TipoTransaccion.js';

const setupAssociations = () => {
  try {
    console.log('Configurando asociaciones...');
    
    // Transaccion pertenece a TipoTransaccion
    Transaccion.belongsTo(TipoTransaccion, {
      foreignKey: 'id_tipo_transaccion_fk',
      targetKey: 'id_tipo_transaccion_pk',
      as: 'tipo_transaccion'
    });

    // TipoTransaccion tiene muchas Transaccion
    TipoTransaccion.hasMany(Transaccion, {
      foreignKey: 'id_tipo_transaccion_fk',
      sourceKey: 'id_tipo_transaccion_pk',
      as: 'transacciones'
    });

    // Transaccion tiene muchos DetalleTransaccion
    Transaccion.hasMany(DetalleTransaccion, {
      foreignKey: 'id_transaccion',
      sourceKey: 'id_transaccion',
      as: 'detalles'
    });

    // DetalleTransaccion pertenece a Transaccion
    DetalleTransaccion.belongsTo(Transaccion, {
      foreignKey: 'id_transaccion',
      targetKey: 'id_transaccion',
      as: 'transaccion'
    });

    console.log('Asociaciones configuradas correctamente');
  } catch (error) {
    console.error('Error configurando asociaciones:', error);
  }
};

export default setupAssociations;