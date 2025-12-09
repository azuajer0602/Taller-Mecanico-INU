import Cliente from '../models/Cliente.js';
import { Op } from 'sequelize';

class ClienteService {
  
  // 1. Traer todos los clientes ACTIVOS con paginación
  async traerTodos(opciones = {}) {
    const {
      pagina = 1,
      limite = 10,
      ordenarPor = 'id_cliente',
      orden = 'DESC'
    } = opciones;

    const offset = (pagina - 1) * limite;

    try {
      const { count, rows } = await Cliente.findAndCountAll({
        where: { estado: 1 }, // <--- FILTRO: Solo activos
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

  // 2. Traer un cliente por ID (Solo si está activo)
  async traerUno(id) {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('ID de cliente inválido');
    }

    try {
      // Usamos findOne en lugar de findByPk para poder filtrar por estado
      const cliente = await Cliente.findOne({
        where: { 
          id_cliente: id,
          estado: 1 // <--- Solo buscar si no ha sido borrado
        }
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      return cliente;
    } catch (error) {
      throw new Error(`Error al obtener cliente: ${error.message}`);
    }
  }

  // 3. Crear nuevo cliente
  async crear(data) {
    // Validación de campos requeridos
    if (!data.cedula || !data.nombre || !data.apellido || !data.correo) {
      throw new Error('Cédula, nombre, apellido y correo son requeridos');
    }

    try {
      // Normalizar datos
      data.cedula = String(data.cedula).trim();
      data.correo = String(data.correo).trim().toLowerCase();
      data.estado = 1; // <--- Aseguramos que nazca activo

      // Validar duplicados (Cédula)
      const clientePorCedula = await Cliente.findOne({
        where: { cedula: data.cedula }
      });

      if (clientePorCedula) {
        // Opcional: Si existe pero estado es 0, podrías informar que fue eliminado anteriormente.
        throw new Error('La cédula ya está registrada');
      }

      // Validar duplicados (Correo)
      const clientePorCorreo = await Cliente.findOne({
        where: { correo: data.correo }
      });

      if (clientePorCorreo) {
        throw new Error('El correo ya está registrado');
      }

      const cliente = await Cliente.create(data);
      return cliente;

    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const mensajes = error.errors.map(err => err.message);
        throw new Error(`Error de validación: ${mensajes.join(', ')}`);
      }
      throw new Error(`Error al crear cliente: ${error.message}`);
    }
  }

  // 4. Actualizar cliente
  async actualizar(id, data) {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('ID de cliente inválido');
    }

    try {
      // Buscamos el cliente asegurando que esté activo
      const cliente = await Cliente.findOne({
        where: { 
          id_cliente: id,
          estado: 1 
        }
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado o inactivo');
      }

      // Normalizar datos de entrada
      if (data.cedula) data.cedula = String(data.cedula).trim();
      if (data.correo) data.correo = String(data.correo).trim().toLowerCase();

      // Validar que la nueva cédula no pertenezca a OTRO cliente
      if (data.cedula && data.cedula !== cliente.cedula) {
        const cedulaExistente = await Cliente.findOne({
          where: {
            cedula: data.cedula,
            id_cliente: { [Op.ne]: id } 
          }
        });

        if (cedulaExistente) {
          throw new Error('La cédula ya está registrada en otro cliente');
        }
      }

      // Validar que el nuevo correo no pertenezca a OTRO cliente
      if (data.correo && data.correo !== cliente.correo) {
        const correoExistente = await Cliente.findOne({
          where: {
            correo: data.correo,
            id_cliente: { [Op.ne]: id }
          }
        });

        if (correoExistente) {
          throw new Error('El correo ya está registrado en otro cliente');
        }
      }

      await cliente.update(data);
      return cliente;

    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const mensajes = error.errors.map(err => err.message);
        throw new Error(`Error de validación: ${mensajes.join(', ')}`);
      }
      throw error;
    }
  }

  // 5. Eliminar cliente (AHORA ES BORRADO LÓGICO)
  async eliminar(id) {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('ID de cliente inválido');
    }

    try {
      const cliente = await Cliente.findOne({
        where: { 
          id_cliente: id, 
          estado: 1 // Solo podemos eliminar si está activo
        }
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      // CAMBIO CLAVE: Update estado=0 en vez de destroy()
      await cliente.update({ estado: 0 });
      
      return { mensaje: 'Cliente eliminado correctamente' };

    } catch (error) {
      throw new Error(`Error al eliminar cliente: ${error.message}`);
    }
  }

  // 6. Buscar clientes por término (Nombre, Cédula, etc.)
  async buscar(termino, opciones = {}) {
    const { limite = 10 } = opciones;

    try {
      const clientes = await Cliente.findAll({
        where: {
          estado: 1, // <--- Solo buscar en activos
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

  // 7. Buscar por Cédula exacta
  async buscarPorCedula(cedula) {
    try {
      const cedulaNormalizada = String(cedula).trim().replace(/^0+/, '');
      
      const cliente = await Cliente.findOne({
        where: { 
          cedula: cedulaNormalizada,
          estado: 1 // <--- Solo devolver si está activo
        }
      });

      return cliente;
    } catch (error) {
      throw new Error(`Error al buscar por cédula: ${error.message}`);
    }
  }
}

export default new ClienteService();