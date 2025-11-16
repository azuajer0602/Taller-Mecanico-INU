import models from '../models/Cliente.js';
import { Op } from 'sequelize';

class ClienteService {
  // Traer todos los clientes con paginación
  async traerTodos(opciones = {}) {
    const {
      pagina = 1,
      limite = 10,
      ordenarPor = 'id_cliente',
      orden = 'DESC'
    } = opciones;

    const offset = (pagina - 1) * limite;

    try {
      const { count, rows } = await models.Cliente.findAndCountAll({
        limit: parseInt(limite),
        offset: parseInt(offset),
        order: [[ordenarPor, orden.toUpperCase()]]
      });

      return {
        clientes: rows,
        paginacion: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total: count,
          totalPaginas: Math.ceil(count / limite)
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener clientes: ${error.message}`);
    }
  }

  // Traer un cliente por ID
  async traerUno(id) {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('ID de cliente inválido');
    }

    try {
      const cliente = await models.Cliente.findByPk(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      return cliente;
    } catch (error) {
      throw new Error(`Error al obtener cliente: ${error.message}`);
    }
  }

  // Crear nuevo cliente
  async crear(data) {
    // Validación de campos requeridos según tu estructura
    if (!data.cedula || !data.nombre || !data.apellido || !data.correo) {
      throw new Error('Cédula, nombre, apellido y correo son requeridos');
    }

    try {
      // Normalizar datos
      data.cedula = String(data.cedula).trim();
      data.correo = String(data.correo).trim().toLowerCase();

      // Verificar si la cédula ya existe
      const clientePorCedula = await models.Cliente.findOne({
        where: { cedula: data.cedula }
      });

      if (clientePorCedula) {
        throw new Error('La cédula ya está registrada');
      }

      // Verificar si el correo ya existe
      const clientePorCorreo = await models.Cliente.findOne({
        where: { correo: data.correo }
      });

      if (clientePorCorreo) {
        throw new Error('El correo ya está registrado');
      }

      const cliente = await models.Cliente.create(data);
      return cliente;

    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const mensajes = error.errors.map(err => err.message);
        throw new Error(`Error de validación: ${mensajes.join(', ')}`);
      }
      throw new Error(`Error al crear cliente: ${error.message}`);
    }
  }

  // Actualizar cliente - CORREGIDO
  async actualizar(id, data) {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('ID de cliente inválido');
    }

    try {
      const cliente = await models.Cliente.findByPk(id);
      
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      // Normalizar datos de entrada
      if (data.cedula) data.cedula = String(data.cedula).trim();
      if (data.correo) data.correo = String(data.correo).trim().toLowerCase();

      // DEBUG: Ver qué datos estamos comparando
      console.log('=== DEBUG ACTUALIZAR CLIENTE ===');
      console.log('Cliente actual:', {
        id: cliente.id,
        cedula: cliente.cedula,
        correo: cliente.correo
      });
      console.log('Datos nuevos:', data);

      // Si se intenta cambiar la cédula, verificar que no exista en OTRO cliente
      if (data.cedula && data.cedula !== cliente.cedula) {
        const cedulaExistente = await models.Cliente.findOne({
          where: { 
            cedula: data.cedula,
            id_cliente: { [Op.ne]: id } // EXCLUIR el cliente actual
          }
        });

        console.log('Resultado verificación cédula:', cedulaExistente ? 'ENCONTRADA' : 'NO ENCONTRADA');

        if (cedulaExistente) {
          throw new Error('La cédula ya está registrada en otro cliente');
        }
      }

      // Si se intenta cambiar el correo, verificar que no exista en OTRO cliente
      if (data.correo && data.correo !== cliente.correo) {
        const correoExistente = await models.Cliente.findOne({
          where: { 
            correo: data.correo,
            id_cliente: { [Op.ne]: id } // EXCLUIR el cliente actual
          }
        });

        console.log('Resultado verificación correo:', correoExistente ? 'ENCONTRADO' : 'NO ENCONTRADO');

        if (correoExistente) {
          throw new Error('El correo ya está registrado en otro cliente');
        }
      }

      await cliente.update(data);
      console.log('Cliente actualizado exitosamente');
      return cliente;

    } catch (error) {
      console.error('Error en actualizar:', error);
      if (error.name === 'SequelizeValidationError') {
        const mensajes = error.errors.map(err => err.message);
        throw new Error(`Error de validación: ${mensajes.join(', ')}`);
      }
      throw error;
    }
  }

  // Eliminar cliente (borrado físico)
  async eliminar(id) {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('ID de cliente inválido');
    }

    try {
      const cliente = await models.Cliente.findByPk(id);
      
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      await cliente.destroy();
      return { mensaje: 'Cliente eliminado correctamente' };

    } catch (error) {
      throw new Error(`Error al eliminar cliente: ${error.message}`);
    }
  }

  // Buscar clientes por nombre, apellido, cédula o correo
  async buscar(termino, opciones = {}) {
    const { limite = 10 } = opciones;

    try {
      const clientes = await models.Cliente.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: `%${termino}%` } },
            { apellido: { [Op.like]: `%${termino}%` } },
            { cedula: { [Op.like]: `%${termino}%` } },
            { correo: { [Op.like]: `%${termino}%` } }
          ]
        },
        limit: parseInt(limite)
      });

      return clientes;
    } catch (error) {
      throw new Error(`Error en búsqueda: ${error.message}`);
    }
  }

  // Buscar por cédula exacta
  async buscarPorCedula(cedula) {
    try {
      const cliente = await models.Cliente.findOne({
        where: { cedula: String(cedula).trim() }
      });

      return cliente;
    } catch (error) {
      throw new Error(`Error al buscar por cédula: ${error.message}`);
    }
  }
}

export default new ClienteService();