import express from 'express';
import controlador from '../controllers/clienteController.js';

const router = express.Router();

// --- DEFINICIÓN DE ENDPOINTS ---
router.get('/', todos);
router.get('/buscar', buscar);
router.get('/cedula/:cedula', buscarPorCedula);
router.get('/:id', uno);
router.post('/', agregar);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

// --- HANDLERS (Funciones que manejan req, res) ---

async function todos(req, res) {
  try {
    const resultado = await controlador.todos(req.query);
    res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function buscar(req, res) {
  try {
    const { q: termino, limite = 10 } = req.query;
    if (!termino) {
      return res.status(400).json({ success: false, message: 'Término de búsqueda requerido' });
    }
    const items = await controlador.buscar(termino, { limite });
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function buscarPorCedula(req, res) {
  try {
    const item = await controlador.buscarPorCedula(req.params.cedula);
    if (!item) {
        return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function uno(req, res) {
  try {
    const item = await controlador.uno(req.params.id);
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
}

async function agregar(req, res) {
  try {
    const nuevo = await controlador.agregar(req.body);
    res.status(201).json({ success: true, message: 'Cliente creado', data: nuevo });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function actualizar(req, res) {
  try {
    const actualizado = await controlador.actualizar(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Cliente actualizado', data: actualizado });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function eliminar(req, res) {
  try {
    const respuesta = await controlador.eliminar(req.params.id);
    res.status(200).json({ success: true, data: respuesta });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export default router;