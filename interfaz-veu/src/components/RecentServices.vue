<template>
  <div>
    <h5 class="mb-3" :style="{ backgroundColor: 'var(--color-red)', color: 'white', padding: '10px' }">Servicios Recientes</h5>
    <ul class="list-group">
      <li class="list-group-item" v-for="s in servicios" :key="s.servicio">
        <strong>{{ s.servicio }}</strong> - Mecánico: {{ s.mecanico }}<br />
        {{ s.hora }} - <span class="fw-bold">{{ s.precio }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
const servicios = [
  { servicio: 'Cambio de Aceite y Filtro', mecanico: 'Roberto Díaz', hora: 'Hoy 08:30', precio: '$25.000' },
  { servicio: 'Reparación de Frenos', mecanico: 'Laura Mendoza', hora: 'Hoy 09:00', precio: '$45.000' },
  { servicio: 'Alineación y Balanceo', mecanico: 'Pedro Sánchez', hora: 'Hoy 09:30', precio: '$30.000' },
  { servicio: 'Reparación de Motor', mecanico: 'Miguel Torres', hora: 'Hoy 10:00', precio: '$120.000' }
]
</script>