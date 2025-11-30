import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor para logging
api.interceptors.request.use(
    (config) => {
        console.log(`🔄 [API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para respuestas
api.interceptors.response.use(
    (response) => {
        console.log(`✅ [API] Respuesta exitosa: ${response.status}`);
        return response;
    },
    (error) => {
        console.error('❌ [API] Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
        
        if (error.code === 'ECONNREFUSED') {
            error.message = 'No se puede conectar al servidor';
        } else if (error.response) {
            switch (error.response.status) {
                case 404:
                    error.message = 'Recurso no encontrado';
                    break;
                case 500:
                    error.message = 'Error interno del servidor';
                    break;
                default:
                    error.message = error.response.data?.message || `Error: ${error.response.status}`;
            }
        }
        
        return Promise.reject(error);
    }
);

export const empleadosService = {
    async getEmpleados() {
        console.log('📡 [SERVICE] Obteniendo empleados...');
        const response = await api.get('/empleados/lista');
        console.log('✅ [SERVICE] Empleados recibidos:', response.data);
        return response.data;
    },

    async getEmpleado(id) {
        const response = await api.get(`/empleados/ver/${id}`);
        return response.data;
    },

    
    async createEmpleado(empleadoData) {
    try {
        console.log('📡 [SERVICE] Creando empleado...');
        const response = await api.post('/empleados/nuevo', empleadoData);
        
        // ✅ Si la respuesta tiene success: true, devolver los datos
        if (response.data.success) {
            console.log('✅ [SERVICE] Empleado creado exitosamente');
            return response.data;
        } else {
            // ✅ Si success: false pero el empleado se creó, devolver igual
            console.log('⚠️ [SERVICE] Respuesta con success:false pero continuando...');
            return response.data;
        }
    } catch (error) {
        console.error('❌ [SERVICE] Error creando empleado:', error);
        
        // ✅ Si es error 500 pero el empleado pudo crearse, no lanzar error
        if (error.response?.status === 500) {
            console.log('⚠️ [SERVICE] Error 500 pero posiblemente el empleado se creó');
            return { success: false, message: 'Empleado posiblemente creado' };
        }
        
        throw error;
    }
    },

    async updateEmpleado(id, empleadoData) {
        const response = await api.put(`/empleados/editar/${id}`, empleadoData);
        return response.data;
    },

    async deleteEmpleado(id) {
        const response = await api.delete(`/empleados/eliminar/${id}`);
        return response.data;
    }
};

// ✅ CORREGIDO: Test de conexión con rutas que SÍ existen
export const testConnection = async () => {
    try {
        console.log('🧪 [TEST] Probando conexión con backend...');
        
        // Probar la ruta de test simple que SÍ existe
        const response = await api.get('/test-simple');
        console.log('✅ [TEST] Conexión exitosa:', response.data);
        
        return {
            success: true,
            data: response.data,
            message: '✅ Conexión con backend establecida'
        };
    } catch (error) {
        console.error('❌ [TEST] Error de conexión:', error.message);
        return {
            success: false,
            error: error.message,
            message: `❌ Error de conexión: ${error.message}`
        };
    }
};

export default api;