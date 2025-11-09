const express = require('express');
const router = express.Router();
const clienteController = require('./clienteController.js');

// api/clientes
router.get('/', clienteController.obtenerClientes);

module.exports = router;