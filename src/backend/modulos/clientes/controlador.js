import db from '../../../DB/mysql.js';

const TABLA ='cliente';

function todos() {    
  return db.traertodos(TABLA);
  
}
function uno(id) {
    return db.traeruno(TABLA, id);
    
}

function eliminar(body) {
    return db.eliminar(TABLA, body);
    
}

function agregar(datos){
return db.agregar(TABLA, datos);

}
export default {
    todos,
    uno,
    eliminar,
    agregar
}