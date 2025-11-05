import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Datos en memoria (temporal - luego usarás base de datos)
let vehiculos = [
    { id: 1, marca: 'Toyota', modelo: 'Corolla', año: 2022, placa: 'ABC123', cliente: 'Juan Pérez' },
    { id: 2, marca: 'Honda', modelo: 'Civic', año: 2023, placa: 'XYZ789', cliente: 'María García' }
];

let diagnosticos = [
    { id: 1, vehiculoId: 1, problema: 'Cambio de aceite', descripcion: 'Aceite motor sintético', fecha: '2024-01-15', estado: 'Completado' },
    { id: 2, vehiculoId: 2, problema: 'Alineación y balanceo', descripcion: 'Alineación completa', fecha: '2024-01-16', estado: 'En proceso' }
];

// ==================== VEHÍCULOS - CRUD COMPLETO ====================

// GET - Obtener todos los vehículos
app.get('/api/vehiculos', (req, res) => {
    res.json({
        success: true,
        data: vehiculos,
        total: vehiculos.length
    });
});

// GET - Obtener un vehículo por ID
app.get('/api/vehiculos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const vehiculo = vehiculos.find(v => v.id === id);
    
    if (!vehiculo) {
        return res.status(404).json({
            success: false,
            message: 'Vehículo no encontrado'
        });
    }
    
    res.json({
        success: true,
        data: vehiculo
    });
});

// POST - Crear nuevo vehículo
app.post('/api/vehiculos', (req, res) => {
    try {
        const { marca, modelo, año, placa, cliente } = req.body;
        
        // Validaciones
        if (!marca || !modelo || !año || !placa) {
            return res.status(400).json({
                success: false,
                message: 'Marca, modelo, año y placa son requeridos'
            });
        }

        // Verificar si la placa ya existe
        const placaExistente = vehiculos.find(v => v.placa === placa);
        if (placaExistente) {
            return res.status(400).json({
                success: false,
                message: 'La placa ya está registrada'
            });
        }

        // Crear nuevo vehículo
        const nuevoVehiculo = {
            id: vehiculos.length > 0 ? Math.max(...vehiculos.map(v => v.id)) + 1 : 1,
            marca,
            modelo,
            año: parseInt(año),
            placa,
            cliente: cliente || 'Sin especificar',
            fechaCreacion: new Date().toISOString()
        };

        vehiculos.push(nuevoVehiculo);

        res.status(201).json({
            success: true,
            message: 'Vehículo creado exitosamente',
            data: nuevoVehiculo
        });

    } catch (error) {
        console.error('Error creando vehículo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// PUT - Actualizar vehículo
app.put('/api/vehiculos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { marca, modelo, año, placa, cliente } = req.body;
        
        const vehiculoIndex = vehiculos.findIndex(v => v.id === id);
        
        if (vehiculoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        // Verificar si la placa ya existe en otro vehículo
        const placaExistente = vehiculos.find(v => v.placa === placa && v.id !== id);
        if (placaExistente) {
            return res.status(400).json({
                success: false,
                message: 'La placa ya está registrada en otro vehículo'
            });
        }

        // Actualizar vehículo
        vehiculos[vehiculoIndex] = {
            ...vehiculos[vehiculoIndex],
            marca: marca || vehiculos[vehiculoIndex].marca,
            modelo: modelo || vehiculos[vehiculoIndex].modelo,
            año: año ? parseInt(año) : vehiculos[vehiculoIndex].año,
            placa: placa || vehiculos[vehiculoIndex].placa,
            cliente: cliente || vehiculos[vehiculoIndex].cliente
        };

        res.json({
            success: true,
            message: 'Vehículo actualizado exitosamente',
            data: vehiculos[vehiculoIndex]
        });

    } catch (error) {
        console.error('Error actualizando vehículo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// DELETE - Eliminar vehículo
app.delete('/api/vehiculos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const vehiculoIndex = vehiculos.findIndex(v => v.id === id);
        
        if (vehiculoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        // Eliminar diagnósticos asociados
        diagnosticos = diagnosticos.filter(d => d.vehiculoId !== id);
        
        // Eliminar vehículo
        const vehiculoEliminado = vehiculos.splice(vehiculoIndex, 1)[0];

        res.json({
            success: true,
            message: 'Vehículo eliminado exitosamente',
            data: vehiculoEliminado
        });

    } catch (error) {
        console.error('Error eliminando vehículo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ==================== DIAGNÓSTICOS - CRUD COMPLETO ====================

// GET - Obtener todos los diagnósticos
app.get('/api/diagnosticos', (req, res) => {
    // Enriquecer datos con información del vehículo
    const diagnosticosConVehiculo = diagnosticos.map(diagnostico => {
        const vehiculo = vehiculos.find(v => v.id === diagnostico.vehiculoId);
        return {
            ...diagnostico,
            vehiculo: vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa})` : 'Vehículo no encontrado'
        };
    });

    res.json({
        success: true,
        data: diagnosticosConVehiculo,
        total: diagnosticos.length
    });
});

// POST - Crear nuevo diagnóstico
app.post('/api/diagnosticos', (req, res) => {
    try {
        const { vehiculoId, problema, descripcion, estado } = req.body;
        
        // Validaciones
        if (!vehiculoId || !problema) {
            return res.status(400).json({
                success: false,
                message: 'vehiculoId y problema son requeridos'
            });
        }

        // Verificar que el vehículo existe
        const vehiculo = vehiculos.find(v => v.id === parseInt(vehiculoId));
        if (!vehiculo) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        // Crear nuevo diagnóstico
        const nuevoDiagnostico = {
            id: diagnosticos.length > 0 ? Math.max(...diagnosticos.map(d => d.id)) + 1 : 1,
            vehiculoId: parseInt(vehiculoId),
            problema,
            descripcion: descripcion || '',
            estado: estado || 'Pendiente',
            fecha: new Date().toISOString().split('T')[0]
        };

        diagnosticos.push(nuevoDiagnostico);

        res.status(201).json({
            success: true,
            message: 'Diagnóstico creado exitosamente',
            data: nuevoDiagnostico
        });

    } catch (error) {
        console.error('Error creando diagnóstico:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ==================== RUTAS GENERALES ====================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '✅ API del Taller Mecánico funcionando correctamente',
        timestamp: new Date().toISOString(),
        estadisticas: {
            vehiculos: vehiculos.length,
            diagnosticos: diagnosticos.length
        }
    });
});

// Ruta de información
app.get('/api/info', (req, res) => {
    res.json({
        name: 'Taller Mecánico API',
        version: '1.0.0',
        description: 'Sistema de gestión para taller mecánico',
        endpoints: {
            vehiculos: {
                'GET /api/vehiculos': 'Obtener todos los vehículos',
                'GET /api/vehiculos/:id': 'Obtener un vehículo',
                'POST /api/vehiculos': 'Crear vehículo',
                'PUT /api/vehiculos/:id': 'Actualizar vehículo',
                'DELETE /api/vehiculos/:id': 'Eliminar vehículo'
            },
            diagnosticos: {
                'GET /api/diagnosticos': 'Obtener todos los diagnósticos',
                'POST /api/diagnosticos': 'Crear diagnóstico'
            }
        }
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo global de errores
app.use((error, req, res, next) => {
    console.error('Error global:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 TALLER MECÁNICO API - CRUD COMPLETO');
    console.log('='.repeat(60));
    console.log(`📡 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Info API: http://localhost:${PORT}/api/info`);
    console.log('='.repeat(60));
    console.log('ENDPOINTS DISPONIBLES:');
    console.log('🚗 VEHÍCULOS:');
    console.log('   GET    /api/vehiculos     - Listar todos');
    console.log('   GET    /api/vehiculos/:id - Obtener por ID');
    console.log('   POST   /api/vehiculos     - Crear nuevo');
    console.log('   PUT    /api/vehiculos/:id - Actualizar');
    console.log('   DELETE /api/vehiculos/:id - Eliminar');
    console.log('🔧 DIAGNÓSTICOS:');
    console.log('   GET    /api/diagnosticos  - Listar todos');
    console.log('   POST   /api/diagnosticos  - Crear nuevo');
    console.log('='.repeat(60));
});