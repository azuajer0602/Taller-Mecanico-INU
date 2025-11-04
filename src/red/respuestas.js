const respuestas = {
    success: function (req, res, message = 'operacion exitosa', status) {
        const statuscode = status || 200;
      
        res.status(statuscode).send({
            error: false,
            status: statuscode,
            body: message
        });
    },
    
    error: function (req, res, message= 'operacion fallida', status, details) {
        const statuscode = status || 500;
        const messagebad = message || 'Operación fallida';  
        res.status(statuscode).send({
            error: true,
            status: statuscode,
            body: message
        });
    }
};

export default respuestas;