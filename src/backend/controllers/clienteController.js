import clienteService from '../services/clienteService.js'; 

async function todos(opciones = {}) {    
  try {
    return await clienteService.traerTodos(opciones);
  } catch (error) {
    throw new Error(`Error en controlador: ${error.message}`);
  }
}

async function uno(id) {
  try {
    return await clienteService.traerUno(id);
  } catch (error) {
    throw new Error(`Error en controlador: ${error.message}`);
  }
}

async function eliminar(id) { 
  try {
    return await clienteService.eliminar(id);
  } catch (error) {
    throw new Error(`Error en controlador: ${error.message}`);
  }
}

// Función para CREAR (POST)
async function agregar(datos) {
  try {
    // Si por error envían un ID, lo quitamos para asegurar que se cree uno nuevo
    const { id_cliente, ...datosCreacion } = datos;
    return await clienteService.crear(datosCreacion);
  } catch (error) {
    throw new Error(`Error en controlador: ${error.message}`);
  }
}

// Función para ACTUALIZAR (PUT) - ESTA ES LA QUE FALTABA
async function actualizar(id, datos) {
  try {
    return await clienteService.actualizar(id, datos);
  } catch (error) {
    throw new Error(`Error en controlador: ${error.message}`);
  }
}

async function buscar(termino, opciones = {}) {
  try {
    return await clienteService.buscar(termino, opciones);
  } catch (error) {
    throw new Error(`Error en controlador: ${error.message}`);
  }
}

async function buscarPorCedula(cedula) {
  try {
    return await clienteService.buscarPorCedula(cedula);
  } catch (error) {
    throw new Error(`Error en controlador: ${error.message}`);
  }
}

// EXPORTAMOS TODAS LAS FUNCIONES, INCLUYENDO 'actualizar'
export default {
  todos,
  uno,
  eliminar,
  agregar,
  actualizar, // <--- ¡AQUÍ ESTABA EL ERROR! Faltaba exportar esto
  buscar,
  buscarPorCedula
};