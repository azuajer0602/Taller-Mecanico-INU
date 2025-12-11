import clienteService from '../services/clienteService.js'; 

const clienteController = {
    
    async todos(opciones) { 
        return await clienteService.traerTodos(opciones);
    },

    async uno(id) {
        return await clienteService.traerUno(id);
    },

    async eliminar(id) { 
        return await clienteService.eliminar(id);
    },

    async agregar(datos) {
        // Quitamos el ID si viene, para que la BD lo genere
        const { id_cliente, ...datosCreacion } = datos;
        return await clienteService.crear(datosCreacion);
    },

    async actualizar(id, datos) {
        return await clienteService.actualizar(id, datos);
    },

    async buscar(termino, opciones) {
        return await clienteService.buscar(termino, opciones);
    },

    async buscarPorCedula(cedula) {
        return await clienteService.buscarPorCedula(cedula);
    }
};

export default clienteController;