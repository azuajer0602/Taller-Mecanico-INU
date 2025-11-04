import express from 'express';
import  respuestas from '../../../red/respuestas.js';
import controlador from './controlador.js';
const router = express.Router();

router.get('/',todos)
router.get('/:id',uno);
router.post('/',agregar)
router.put('/',eliminar);


async function todos(req, res,todos)  {
  try {
  const items  = await controlador.todos();
  respuestas.success(req, res, items, 200);
  }catch (err) {
     next(err);
 }

};

 async function uno(req, res,next)  {
 try {
 const items  = await controlador.uno(req.params.id);
 if (items.length === 0) {
    return respuestas.error(req, res, 'El cliente no existe', 404);
 }
  respuestas.success(req, res, items, 200);
  } catch (err) {
   next(err);
 }
 };


async function agregar(req, res, next) {
  try {
    const id = req.body.id_cliente;
    const esNuevo = !id || id === 0;

    const items = await controlador.agregar(req.body);

    const message = esNuevo
      ? 'Item guardado con éxito'
      : 'Item actualizado con éxito';

    respuestas.success(req, res, message, 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const campo = err.sqlMessage.match(/for key '(.+?)'/)?.[1] || 'clave duplicada';
      const mensaje = `Ya existe un registro con ese valor en el campo '${campo}'`;
      return respuestas.error(req, res, mensaje, 400, err);
    }

    next(err);
  }
}
  async function eliminar(req, res,next)  {
 try {
 const items  = await controlador.eliminar(req.body);
 
  respuestas.success(req, res, 'item eliminado satisfactoriamente', 200);
  } catch (err) {
    next(err);
 }
 };

 
export default router;