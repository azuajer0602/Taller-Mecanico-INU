const respuestas = {
  success: function (req, res, data = 'Operación exitosa', status = 200) {
    // CORRECCIÓN DEFINITIVA: No envolver 'data' si ya es un objeto con 'data' o 'message'.
    // Esto evita el problema de data: { data: ... }
    const isObjectWithData = typeof data === 'object' && (data.data || data.message);
    const responseBody = isObjectWithData ? data : { data: data };

    res.status(status).send({
      success: true,
      ...responseBody,
    });
  },

  error: function (req, res, message = 'Operación fallida', status = 500, details) {
    console.error('[Error Response]:', details || message); // Log del error en el servidor
    res.status(status).send({
      success: false,
      message: message
    });
  }
};

export default respuestas;