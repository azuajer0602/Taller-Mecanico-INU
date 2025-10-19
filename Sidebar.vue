<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h4 class="sidebar-title">Gestión de Gastos</h4>
    </div>
    <ul class="sidebar-menu">
      <li class="menu-item" @click="selectOption('registrar')" :class="{ active: activeOption === 'registrar' }">
        <span class="icon">📝</span> Registrar Gasto
      </li>
      <li class="menu-item" @click="selectOption('ver')" :class="{ active: activeOption === 'ver' }">
        <span class="icon">📊</span> Ver Gastos
      </li>
      <li class="menu-item" @click="selectOption('estadisticas')" :class="{ active: activeOption === 'estadisticas' }">
        <span class="icon">📈</span> Estadísticas
      </li>
      <li class="menu-item" @click="selectOption('gestion-gastos')" :class="{ active: activeOption === 'gestion-gastos' }">
        <span class="icon">🔧</span> Gestión de Gastos
        <ul class="submenu" v-if="activeOption === 'gestion-gastos'">
          <li class="submenu-item" @click="selectOption('registrar-taller')">Registrar Gasto de Taller</li>
          <li class="submenu-item" @click="selectOption('ver-taller')">Ver Gastos de Taller</li>
        </ul>
      </li>
      <li class="menu-item" @click="selectOption('categorias')" :class="{ active: activeOption === 'categorias' }">
        <span class="icon">🏷️</span> Categorías
        <ul class="submenu" v-if="activeOption === 'categorias'">
          <li class="submenu-item" v-for="cat in categorias" :key="cat">{{ cat }}</li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeOption = ref('registrar')
const categorias = [
  'Viajes',
  'Comidas',
  'Suministros',
  'Marketing',
  'Otros'
]

const selectOption = (option) => {
  if (option === 'registrar-taller' || option === 'ver-taller') {
    activeOption.value = 'gestion-gastos'
  } else {
    activeOption.value = option
  }
  // Emitir evento para cambiar la vista principal
  emit('change-view', option)
  console.log('Opción seleccionada:', option)
}

const emit = defineEmits(['change-view'])
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: #F84600;
  color: #ffffff;
  position: fixed;
  left: 0;
  top: 0;
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.sidebar-header {
  margin-bottom: 30px;
}

.sidebar-title {
  font-weight: bold;
  text-align: center;
  color: #ffffff;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
}

.menu-item {
  padding: 15px;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
}

.menu-item:hover {
  background: rgba(255,255,255,0.2);
}

.menu-item.active {
  background: rgba(255,255,255,0.3);
}

.icon {
  margin-right: 10px;
  font-size: 1.2em;
}

.submenu {
  list-style: none;
  padding-left: 30px;
  margin-top: 10px;
}

.submenu-item {
  padding: 5px 0;
  font-size: 0.9em;
  color: #f0f0f0;
}
</style>
