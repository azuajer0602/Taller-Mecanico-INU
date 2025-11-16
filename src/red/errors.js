import respuestas from "./respuestas.js";

function error(err,req,res,next){
    console.log('error:',err);
    const message = err.message || 'Error interno';
    const statusCode = err.statusCode || 500;
    respuestas.error(req,res,message,statusCode);
}   

export default error;