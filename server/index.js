const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); 
require('dotenv').config();

// Crear el servidor
const app = express();

app.use(cors());

app.use(express.json());

const PORT = process.env.API_PORT || 3000;

sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('Conectado a la base de datos y modelos sincronizados.');
    // Arrancar la app solo después de conectar a la BD
    app.listen(PORT, () => {
      console.log(`El servidor está funcionando en el puerto ${PORT}`);
    });
  })
  .catch(err => console.error('No se pudo conectar a la base de datos:', err));

// Importar rutas
app.use('/api/facturas', require('./facturaRoutes.js')); 
app.use('/api/clientes', require('./clienteRoutes.js')); 

app.get('/', (req, res) => {
    res.send('API de Mecanosoft Taller funcionando!');
});
