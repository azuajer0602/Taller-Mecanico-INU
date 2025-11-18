<script setup>
import Side from '../components/SidebarComponent.vue'; // Importo el componente Sidebar
import { ref, computed, onMounted, reactive } from 'vue'; // Importar reactive y ref para Vue 3 Composition API

const API_BASE = 'http://localhost:3000/api';

// Datos reactivos usando ref y reactive
const vehiculoSeleccionado = ref('');
const vehiculoActual = ref(null);
const vehiculos = ref([]);
const sistemaAbierto = ref('motor');
const mostrarResumen = ref(true);
const loading = ref(false);
const mensaje = ref('');
const mensajeTipo = ref('alert-success');
const mensajeIcono = ref('fa-check');

const sistemas = [
    {
        id: 'motor',
        nombre: 'Motor',
        icono: 'fas fa-cog',
        color: 'bg-danger',
        fallas: [
            { id: 'm1', descripcion: 'Fuga de aceite' },
            { id: 'm2', descripcion: 'Sobrecalentamiento' },
            { id: 'm3', descripcion: 'Pérdida de potencia' },
            { id: 'm4', descripcion: 'Ruidos anormales' }
        ]
    },
    {
        id: 'frenos',
        nombre: 'Frenos',
        icono: 'fas fa-tachometer-alt',
        color: 'bg-warning',
        fallas: [
            { id: 'f1', descripcion: 'Desgaste de pastillas' },
            { id: 'f2', descripcion: 'Fuga de líquido' },
            { id: 'f3', descripcion: 'Vibración al frenar' }
        ]
    },
    {
        id: 'suspension',
        nombre: 'Suspensión',
        icono: 'fas fa-compass',
        color: 'bg-info',
        fallas: [
            { id: 's1', descripcion: 'Amortiguadores' },
            { id: 's2', descripcion: 'Terminales' },
            { id: 's3', descripcion: 'Brazos de control' }
        ]
    },
    {
        id: 'electrico',
        nombre: 'Eléctrico',
        icono: 'fas fa-bolt',
        color: 'bg-success',
        fallas: [
            { id: 'e1', descripcion: 'Problemas de batería' },
            { id: 'e2', descripcion: 'Alternador' },
            { id: 'e3', descripcion: 'Cortocircuitos' }
        ]
    }
];

const diagnosticoInicial = {
    motor: { estado: 'optimo', fallas: [], observaciones: '' },
    frenos: { estado: 'optimo', nivelDesgaste: 'medio', fallas: [], observaciones: '' },
    suspension: { estado: 'optimo', fallas: [], observaciones: '' },
    electrico: { estado: 'optimo', fallas: [], observaciones: '' }
};

const diagnosticoActual = reactive({...diagnosticoInicial});

// Métodos de estado
const getStatusClass = (estado) => {
    const clases = {
        optimo: 'bg-success',
        leve: 'bg-warning text-dark',
        moderado: 'bg-warning text-dark',
        critico: 'bg-danger'
    };
    return clases[estado] || 'bg-success';
};

const getStatusText = (estado) => {
    const textos = {
        optimo: 'Óptimo',
        leve: 'Leves',
        moderado: 'Moderados',
        critico: 'Crítico'
    };
    return textos[estado] || 'Óptimo';
};

// Computed Properties
const diagnosticoCompleto = computed(() => {
    return Object.values(diagnosticoActual).some(sistema => 
        sistema.estado !== 'optimo' || 
        sistema.fallas.length > 0 || 
        sistema.observaciones.trim() !== ''
    );
});

const tieneFallas = computed(() => {
    return Object.values(diagnosticoActual).some(sistema => sistema.fallas.length > 0);
});

const sistemasCompletados = computed(() => {
    return Object.values(diagnosticoActual).filter(sistema => 
        sistema.estado !== 'optimo' || sistema.fallas.length > 0 || sistema.observaciones.trim() !== ''
    ).length;
});

const totalFallas = computed(() => {
    return Object.values(diagnosticoActual).reduce((total, sistema) => 
        total + sistema.fallas.length, 0
    );
});

// Métodos
const onVehiculoSeleccionado = () => {
    console.log('Vehículo seleccionado:', vehiculoSeleccionado.value);
    
    if (vehiculoSeleccionado.value) {
        vehiculoActual.value = vehiculos.value.find(v => v.id == vehiculoSeleccionado.value);
        console.log('Vehículo actual:', vehiculoActual.value);
        
        if (vehiculoActual.value) {
            limpiarDiagnostico();
            mostrarResumen.value = true;
            sistemaAbierto.value = 'motor';
        }
    } else {
        vehiculoActual.value = null;
    }
};

const toggleSistema = (sistemaId) => {
    sistemaAbierto.value = sistemaAbierto.value === sistemaId ? null : sistemaId;
};

const expandirTodos = () => {
    sistemaAbierto.value = 'motor'; // Abre el primero, para simular expandir todos en el contexto de un acordeón
};

const colapsarTodos = () => {
    sistemaAbierto.value = null;
};

const cargarVehiculos = async () => {
    loading.value = true;
    try {
        console.log('Cargando vehículos...');
        const response = await fetch(`${API_BASE}/vehiculos`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Respuesta vehículos:', data);
        
        if (data.success) {
            vehiculos.value = data.data;
            console.log(`✅ Cargados ${vehiculos.value.length} vehículos`);
        } else {
            throw new Error(data.message || 'Error en la respuesta');
        }
    } catch (error) {
        console.error('Error cargando vehículos:', error);
        mostrarMensaje(
            'Error al cargar vehículos: ' + error.message, 
            'alert-danger', 
            'fa-exclamation-triangle'
        );
    } finally {
        loading.value = false;
    }
};

const generarDescripcionProblema = () => {
    const sistemasConProblemas = sistemas.filter(sistema => 
        diagnosticoActual[sistema.id].estado !== 'optimo' || 
        diagnosticoActual[sistema.id].fallas.length > 0
    );
    
    if (sistemasConProblemas.length === 0) {
        return 'Diagnóstico preventivo';
    }
    
    return sistemasConProblemas.map(sistema => sistema.nombre).join(', ');
};

const generarDescripcionCompleta = () => {
    let descripcion = `Diagnóstico del vehículo ${vehiculoActual.value?.placa}\n\n`;
    
    sistemas.forEach(sistema => {
        const datos = diagnosticoActual[sistema.id];
        if (datos.estado !== 'optimo' || datos.fallas.length > 0 || datos.observaciones) {
            descripcion += `${sistema.nombre}: ${getStatusText(datos.estado)}\n`;
            if (datos.fallas.length > 0) {
                descripcion += `Fallas: ${datos.fallas.map(f => 
                    sistema.fallas.find(sf => sf.id === f)?.descripcion
                ).join(', ')}\n`;
            }
            if (datos.observaciones.trim()) {
                descripcion += `Observaciones: ${datos.observaciones}\n`;
            }
            descripcion += '\n';
        }
    });
    
    return descripcion;
};

const guardarDiagnostico = async () => {
    if (!diagnosticoCompleto.value) {
        mostrarMensaje('Complete al menos un sistema', 'alert-warning', 'fa-exclamation-circle');
        return;
    }

    loading.value = true;
    try {
        const diagnosticoData = {
            vehiculoId: parseInt(vehiculoSeleccionado.value),
            problema: generarDescripcionProblema(),
            descripcion: generarDescripcionCompleta(),
            estado: 'En revisión'
        };

        console.log('Enviando diagnóstico:', diagnosticoData);

        const response = await fetch(`${API_BASE}/diagnosticos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(diagnosticoData)
        });

        const data = await response.json();
        console.log('Respuesta guardar diagnóstico:', data);
        
        if (data.success) {
            mostrarMensaje('✅ Diagnóstico guardado', 'alert-success', 'fa-check-circle');
            vehiculoSeleccionado.value = '';
            vehiculoActual.value = null;
            limpiarDiagnostico();
        } else {
            mostrarMensaje('❌ Error: ' + data.message, 'alert-danger', 'fa-exclamation-triangle');
        }
    } catch (error) {
        console.error('Error guardando diagnóstico:', error);
        mostrarMensaje('❌ Error de conexión', 'alert-danger', 'fa-exclamation-triangle');
    } finally {
        loading.value = false;
    }
};

const limpiarDiagnostico = () => {
    // Restaurar a valores iniciales
    Object.assign(diagnosticoActual, JSON.parse(JSON.stringify(diagnosticoInicial)));
};

const mostrarMensaje = (texto, tipo, icono) => {
    mensaje.value = texto;
    mensajeTipo.value = tipo;
    mensajeIcono.value = icono;
    
    setTimeout(() => {
        mensaje.value = '';
    }, 5000);
};

// Ciclo de vida
onMounted(async () => {
    console.log('Componente montado - Cargando vehículos...');
    await cargarVehiculos();
});
</script>

<template>
    <Side/>
    <div class="main-content">
        <div class="diagnostico-container container-fluid py-4">
            <div class="page-header mb-4">
                <h2 class="mb-0 text-dark fw-bold">
                    <i class="fas fa-stethoscope me-2 text-primary"></i>Diagnóstico Técnico
                </h2>
                <p class="text-muted mb-0">Sistema completo de diagnóstico para vehículos</p>
            </div>

            <div v-if="mensaje" class="alert" :class="mensajeTipo" role="alert">
                <i class="fas" :class="mensajeIcono"></i> {{ mensaje }}
            </div>

            <div class="card shadow-sm mb-4">
                <div class="card-header bg-dark text-warning">
                    <h5 class="mb-0">
                        <i class="fas fa-car me-2"></i>Seleccionar Vehículo para Diagnóstico
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row align-items-end">
                        <div class="col-md-8">
                            <label class="form-label fw-semibold">Vehículo *</label>
                            <select class="form-select" v-model="vehiculoSeleccionado" @change="onVehiculoSeleccionado" :disabled="loading">
                                <option value="">Seleccionar vehículo...</option>
                                <option v-for="vehiculo in vehiculos" :key="vehiculo.id" :value="vehiculo.id">
                                    {{ vehiculo.placa }} - {{ vehiculo.marca }} {{ vehiculo.modelo }} ({{ vehiculo.año }})
                                </option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-outline-primary w-100 mt-md-0 mt-2" @click="cargarVehiculos" :disabled="loading">
                                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                                Actualizar Lista
                            </button>
                        </div>
                    </div>
                    <small class="form-text text-muted mt-2">
                        Seleccione un vehículo registrado para realizar el diagnóstico técnico.
                    </small>
                </div>
            </div>

            <div v-if="vehiculoSeleccionado && vehiculoActual" class="card border-primary mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-info-circle me-2"></i>Información del Vehículo Seleccionado
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <strong>Placa:</strong> {{ vehiculoActual.placa }}
                        </div>
                        <div class="col-md-3">
                            <strong>Marca/Modelo:</strong> {{ vehiculoActual.marca }} {{ vehiculoActual.modelo }}
                        </div>
                        <div class="col-md-3">
                            <strong>Año:</strong> {{ vehiculoActual.año }}
                        </div>
                        <div class="col-md-3">
                            <strong>Color:</strong> {{ vehiculoActual.color || 'N/A' }}
                        </div>
                    </div>
                    <div class="row mt-2" v-if="vehiculoActual.cliente">
                        <div class="col-12">
                            <strong>Cliente:</strong> {{ vehiculoActual.cliente }}
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="vehiculoSeleccionado && vehiculoActual">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="text-dark mb-0">
                        <i class="fas fa-clipboard-list me-2 text-warning"></i>Sistemas del Vehículo
                    </h4>
                    <div class="btn-group">
                        <button class="btn btn-outline-success btn-sm" @click="expandirTodos">
                            <i class="fas fa-expand me-1"></i>Expandir Todos
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" @click="colapsarTodos">
                            <i class="fas fa-compress me-1"></i>Colapsar Todos
                        </button>
                    </div>
                </div>

                <div class="accordion" id="diagnosticoAccordion">
                    <div class="accordion-item" v-for="sistema in sistemas" :key="sistema.id">
                        <h2 class="accordion-header">
                            <button 
                                class="accordion-button" 
                                :class="{ collapsed: sistemaAbierto !== sistema.id }"
                                type="button" 
                                @click="toggleSistema(sistema.id)"
                            >
                                <div class="d-flex align-items-center w-100">
                                    <div class="sistema-icon rounded p-2 me-3 text-white" :class="sistema.color">
                                        <i :class="sistema.icono"></i>
                                    </div>
                                    <div class="flex-grow-1">
                                        <h6 class="mb-1 fw-semibold">{{ sistema.nombre }}</h6>
                                        <span class="badge" :class="getStatusClass(diagnosticoActual[sistema.id].estado)">
                                            {{ getStatusText(diagnosticoActual[sistema.id].estado) }}
                                        </span>
                                    </div>
                                    <div class="ms-2">
                                        <small class="text-muted">
                                            {{ diagnosticoActual[sistema.id].fallas.length }} falla(s)
                                        </small>
                                    </div>
                                </div>
                            </button>
                        </h2>
                        <div 
                            class="accordion-collapse collapse" 
                            :class="{ show: sistemaAbierto === sistema.id }"
                        >
                            <div class="accordion-body bg-light">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Estado del Sistema *</label>
                                        <select class="form-select" v-model="diagnosticoActual[sistema.id].estado" :disabled="loading">
                                            <option value="optimo">✅ Óptimo</option>
                                            <option value="leve">⚠️ Problemas Leves</option>
                                            <option value="moderado">🔧 Problemas Moderados</option>
                                            <option value="critico">🚨 Crítico</option>
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-6" v-if="sistema.id === 'frenos'">
                                        <label class="form-label fw-semibold">Nivel de Desgaste</label>
                                        <select class="form-select" v-model="diagnosticoActual[sistema.id].nivelDesgaste" :disabled="loading">
                                            <option value="nuevo">Nuevo (0-20%)</option>
                                            <option value="medio">Medio (21-60%)</option>
                                            <option value="avanzado">Avanzado (61-90%)</option>
                                            <option value="critico">Crítico (91-100%)</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="mt-4">
                                    <label class="form-label fw-semibold">Fallas Detectadas</label>
                                    <div class="row g-2">
                                        <div class="col-md-6 col-lg-4" v-for="falla in sistema.fallas" :key="falla.id">
                                            <div class="form-check p-2 border rounded hover-shadow">
                                                <input 
                                                    class="form-check-input" 
                                                    type="checkbox" 
                                                    :id="`falla-${sistema.id}-${falla.id}`"
                                                    v-model="diagnosticoActual[sistema.id].fallas" 
                                                    :value="falla.id"
                                                    :disabled="loading"
                                                >
                                                <label class="form-check-label w-100" :for="`falla-${sistema.id}-${falla.id}`">
                                                    {{ falla.descripcion }}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mt-4">
                                    <label class="form-label fw-semibold">Observaciones</label>
                                    <textarea 
                                        class="form-control" 
                                        rows="3" 
                                        v-model="diagnosticoActual[sistema.id].observaciones"
                                        :disabled="loading"
                                        :placeholder="`Describa el estado del ${sistema.nombre.toLowerCase()}...`"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card mt-4 border-primary">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-tools me-2"></i>Acciones del Diagnóstico
                        </h5>
                        <div>
                            <span class="badge bg-secondary me-2">
                                Sistemas: {{ sistemasCompletados }}/{{ sistemas.length }}
                            </span>
                            <span class="badge bg-info">
                                Fallas: {{ totalFallas }}
                            </span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                            <div>
                                <button class="btn btn-secondary me-2" @click="limpiarDiagnostico" :disabled="loading">
                                    <i class="fas fa-eraser me-1"></i>Limpiar Todo
                                </button>
                                <button class="btn btn-outline-warning" @click="mostrarResumen = !mostrarResumen">
                                    <i class="fas" :class="mostrarResumen ? 'fa-eye-slash' : 'fa-eye'"></i>
                                    {{ mostrarResumen ? 'Ocultar' : 'Ver' }} Resumen
                                </button>
                            </div>
                            <button class="btn btn-success" @click="guardarDiagnostico" :disabled="!diagnosticoCompleto || loading">
                                <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                                {{ loading ? 'Guardando...' : 'Guardar Diagnóstico' }}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card mt-4 border-warning" v-if="mostrarResumen">
                    <div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-chart-bar me-2"></i>Resumen del Diagnóstico
                        </h5>
                        <button class="btn btn-sm btn-outline-dark" @click="mostrarResumen = false">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="row g-3 mb-4">
                            <div class="col-md-6 col-lg-3" v-for="sistema in sistemas" :key="sistema.id">
                                <div class="d-flex justify-content-between align-items-center p-3 border rounded bg-white shadow-sm">
                                    <div class="d-flex align-items-center">
                                        <div class="sistema-icon-sm rounded p-1 me-2 text-white" :class="sistema.color">
                                            <i :class="sistema.icono"></i>
                                        </div>
                                        <span class="fw-semibold">{{ sistema.nombre }}</span>
                                    </div>
                                    <span class="badge" :class="getStatusClass(diagnosticoActual[sistema.id].estado)">
                                        {{ getStatusText(diagnosticoActual[sistema.id].estado) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4" v-if="tieneFallas">
                            <h6 class="fw-semibold border-bottom pb-2">Fallas Detectadas:</h6>
                            <div class="row g-2">
                                <div 
                                    v-for="sistema in sistemas" 
                                    :key="sistema.id"
                                    class="col-12"
                                    v-if="diagnosticoActual[sistema.id].fallas.length > 0"
                                >
                                    <div class="alert alert-warning py-2">
                                        <strong>{{ sistema.nombre }}:</strong>
                                        {{ diagnosticoActual[sistema.id].fallas.map(fallaId => 
                                            sistema.fallas.find(f => f.id === fallaId)?.descripcion
                                        ).join(', ') }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="vehiculos.length > 0" class="card text-center py-5 shadow-sm">
                <div class="card-body">
                    <div class="text-primary mb-4">
                        <i class="fas fa-car fa-4x opacity-75"></i>
                    </div>
                    <h3 class="text-dark mb-3">Seleccione un Vehículo</h3>
                    <p class="text-muted mb-4 fs-5">
                        Elija un vehículo de la lista superior para comenzar el diagnóstico.
                    </p>
                </div>
            </div>

            <div v-else class="card text-center py-5 shadow-sm">
                <div class="card-body">
                    <div class="text-warning mb-4">
                        <i class="fas fa-exclamation-triangle fa-3x"></i>
                    </div>
                    <h4 class="text-dark mb-3">No hay vehículos registrados</h4>
                    <p class="text-muted mb-4">
                        Para realizar diagnósticos, primero debe registrar vehículos en el sistema.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Estilos para el Sidebar y Contenido Principal */
.main-content {
    padding: 20px;
    min-height: 100vh;
    margin-left: 250px; /* Igual que el ejemplo, para dejar espacio al Sidebar */
    /* Fondo personalizado para el Diagnóstico */
    background: linear-gradient(#ff7e5f, #feb47b);
}

@media (max-width: 992px) {
    .main-content {
        margin-left: 0;
        padding: 15px;
        align-items: flex-start; 
    }
}

/* Estilos específicos de la vista Diagnostico */
.diagnostico-container {
    max-width: 1200px; /* Un poco más ancho que el de clientes, si es necesario */
    margin: 0 auto;
}

.hover-shadow:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transform: translateY(-1px);
    transition: all 0.3s ease;
}

.sistema-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.sistema-icon-sm {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
}

.accordion-button:not(.collapsed) {
    background-color: #e9ecef; /* Un gris más claro para el activo */
    color: #2c3e50;
    font-weight: 600;
}

.accordion-button:focus {
    box-shadow: none;
    border-color: transparent;
}

.card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border-radius: 12px;
}

.card-header {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}

.alert {
    border-left: 4px solid;
    border-radius: 8px;
}

.alert-success { border-left-color: #198754; }
.alert-danger { border-left-color: #dc3545; }
.alert-warning { border-left-color: #ffc107; }

.bg-danger { background-color: #dc3545 !important; }
.bg-warning { background-color: #ffc107 !important; }
.bg-info { background-color: #0dcaf0 !important; }
.bg-success { background-color: #198754 !important; }
.bg-primary { background-color: #0d6efd !important; } 
</style>