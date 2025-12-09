import { defineStore } from 'pinia';
import router from '../router';
import axios from 'axios';
const setAuthHeader = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('authToken') || null, 
        user: JSON.parse(localStorage.getItem('userData')) || null,
    }),
    
    getters: {
        // Devuelve true si hay un token
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => {
            if (!state.user || !state.user.cargo) return false;
            return state.user.cargo.toLowerCase() === 'administrador';
        },

        isMecanico: (state) => {
        if (!state.user || !state.user.cargo) return false;
        return state.user.cargo.toLowerCase() === 'mecanico';
    },
        userCargo: (state) => state.user ? state.user.cargo : null,
    },

    actions: {
        setAuthData(userData, token) {
            this.user = userData;
            this.token = token;
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('authToken', token);
            
            setAuthHeader(token);
        },
        
        logout() {
            this.user = null;
            this.token = null;
            localStorage.clear();
            setAuthHeader(null);
             router.push('/');
        }
    }
});