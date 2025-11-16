import clienteService from '../services/clienteService.js'; // Importar el servicio

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

async function eliminar(id) { // Cambiado para recibir solo el ID
  try {
    return await clienteService.eliminar(id);
  } catch (error) {
    throw new Error(`Error en controlador: ${error.message}`);
  }
}

async function agregar(datos) {
  try {
    // Si viene con id_cliente, es actualización, sino es creación
    if (datos.id_cliente && datos.id_cliente !== 0) {
      return await clienteService.actualizar(datos.id_cliente, datos);
    } else {
      // Remover id_cliente si es 0 o null para creación
      const { id_cliente, ...datosCreacion } = datos;
      return await clienteService.crear(datosCreacion);
    }
  } catch (error) {
    throw new Error(`Error en controlador: ${error.message}`);
  }
}

// Nuevos métodos para funcionalidades adicionales
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

export default {
  todos,
  uno,
  eliminar,
  agregar,
  buscar,
  buscarPorCedula
};