<template>
    <div class="connection-test">
        <div class="alert" :class="alertClass" role="alert">
            <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                    <strong>{{ statusIcon }} Estado del Backend:</strong> 
                    {{ statusText }}
                    <div v-if="connectionStatus" class="small mt-1">
                        {{ connectionStatus.message }}
                    </div>
                </div>
                <button 
                    @click="testConnection" 
                    :disabled="testing" 
                    class="btn btn-sm ms-3"
                    :class="buttonClass"
                >
                    {{ testing ? '🔄 Probando...' : '🔍 Probar' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { testConnection } from '../services/api.js';

export default {
    name: 'ConnectionTest',
    data() {
        return {
            testing: false,
            connectionStatus: null
        };
    },
    computed: {
        statusText() {
            if (this.testing) return 'Probando conexión...';
            if (this.connectionStatus?.success) return 'Conectado ✓';
            if (this.connectionStatus) return 'Error de conexión ✗';
            return 'No probado';
        },
        alertClass() {
            if (this.connectionStatus?.success) return 'alert-success';
            if (this.connectionStatus) return 'alert-danger';
            return 'alert-warning';
        },
        statusIcon() {
            if (this.connectionStatus?.success) return '✅';
            if (this.connectionStatus) return '❌';
            return '⚠️';
        },
        buttonClass() {
            if (this.connectionStatus?.success) return 'btn-outline-success';
            if (this.connectionStatus) return 'btn-outline-danger';
            return 'btn-outline-warning';
        }
    },
    methods: {
        async testConnection() {
            this.testing = true;
            try {
                this.connectionStatus = await testConnection();
            } catch (error) {
                this.connectionStatus = {
                    success: false,
                    message: 'Error inesperado en la conexión'
                };
            } finally {
                this.testing = false;
            }
        }
    },
    mounted() {
        // Probar automáticamente al cargar
        setTimeout(() => {
            this.testConnection();
        }, 1000);
    }
};
</script>

<style scoped>
.connection-test {
    margin-bottom: 20px;
}
.small {
    font-size: 0.875em;
}
</style>