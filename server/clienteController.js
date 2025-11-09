const { Cliente } = require('./models');

exports.obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
};

// agregar funciones para crear, actualizar y eliminar clientes.
