const express = require('express');
const router = express.Router();
const facturaController = require('./facturaController.js'); 

// api/facturas
router.post('/', facturaController.crearFactura);
router.get('/', facturaController.obtenerFacturas);
router.patch('/:id/estado', facturaController.actualizarEstado); 
router.patch('/:id/anular', facturaController.anularFactura);  

module.exports = router;