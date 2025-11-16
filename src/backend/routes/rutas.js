import express from 'express';
import respuestas from '../../red/respuestas.js';
import controlador from '../controllers/clienteController.js';

const router = express.Router();

router.get('/', todos);
router.get('/buscar', buscar);
router.get('/cedula/:cedula', buscarPorCedula); // Nueva ruta
router.get('/:id', uno);
router.post('/', agregar);
router.put('/:id', actualizar); // Ruta específica para actualizar
router.delete('/:id', eliminar);

async function todos(req, res, next) {
  try {
    const items = await controlador.todos(req.query);
    respuestas.success(req, res, items, 200);
  } catch (err) {
    next(err);
  }
}

async function buscar(req, res, next) {
  try {
    const { q: termino, limite = 10 } = req.query;
    
    if (!termino) {
      return respuestas.error(req, res, 'Término de búsqueda requerido', 400);
    }

    const items = await controlador.buscar(termino, { limite: parseInt(limite) });
    respuestas.success(req, res, items, 200);
  } catch (err) {
    next(err);
  }
}

async function buscarPorCedula(req, res, next) {
  try {
    const { cedula } = req.params;
    const item = await controlador.buscarPorCedula(cedula);
    
    if (!item) {
      return respuestas.error(req, res, 'Cliente no encontrado', 404);
    }
    
    respuestas.success(req, res, item, 200);
  } catch (err) {
    next(err);
  }
}

async function uno(req, res, next) {
  try {
    const items = await controlador.uno(req.params.id);
    respuestas.success(req, res, items, 200);
  } catch (err) {
    if (err.message.includes('no encontrado') || err.message.includes('inválido')) {
      return respuestas.error(req, res, err.message, 404);
    }
    next(err);
  }
}

async function agregar(req, res, next) {
  try {
    const items = await controlador.agregar(req.body);
    
    const message = req.body.id_cliente && req.body.id_cliente !== 0 
      ? 'Cliente actualizado con éxito' 
      : 'Cliente creado con éxito';
    
    respuestas.success(req, res, { message, data: items }, 201);
  } catch (err) {
    if (err.message.includes('registrado') || err.message.includes('requerido') || err.message.includes('validación')) {
      return respuestas.error(req, res, err.message, 400);
    }
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const items = await controlador.agregar({
      id_cliente: req.params.id,
      ...req.body
    });
    
    respuestas.success(req, res, { 
      message: 'Cliente actualizado con éxito', 
      data: items 
    }, 200);
  } catch (err) {
    if (err.message.includes('no encontrado')) {
      return respuestas.error(req, res, err.message, 404);
    }
    if (err.message.includes('registrado') || err.message.includes('validación')) {
      return respuestas.error(req, res, err.message, 400);
    }
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    const items = await controlador.eliminar(req.params.id);
    respuestas.success(req, res, items, 200);
  } catch (err) {
    if (err.message.includes('no encontrado')) {
      return respuestas.error(req, res, err.message, 404);
    }
    next(err);
  }
}

export default router;