// backend/controllers/tipoTransaccionController.js
import TipoTransaccion from '../models/TipoTransaccion.js';

export const getAllTipos = async (req, res) => {
  try {
    const tipos = await TipoTransaccion.findAll();
    res.json({
      success: true,
      data: tipos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos',
      error: error.message
    });
  }
};