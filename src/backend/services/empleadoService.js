import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Ajusta según tu backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la petición:', error);
    return Promise.reject(error);
  }
);

export const empleadoService = {
  // Crear nuevo empleado
  async crearEmpleado(empleadoData) {
    try {
      const response = await api.post('/empleados', empleadoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener todos los empleados
  async obtenerEmpleados() {
    try {
      const response = await api.get('/empleados');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener empleado por ID
  async obtenerEmpleadoPorId(id) {
    try {
      const response = await api.get(`/empleados/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar empleado
  async actualizarEmpleado(id, empleadoData) {
    try {
      const response = await api.put(`/empleados/${id}`, empleadoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar empleado
  async eliminarEmpleado(id) {
    try {
      const response = await api.delete(`/empleados/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;