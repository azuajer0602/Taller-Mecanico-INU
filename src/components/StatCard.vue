<template>
  <div class="stat-card">
    <div class="icon" :style="{ backgroundColor: iconBgColor }">
      <slot name="icon">?</slot>
    </div>
    <div class="content">
      <div class="title">{{ title }}</div>
      <div class="value">{{ value }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    value: [String, Number],
    iconBgColor: {
      type: String,
      default: 'var(--accent-primary)', // Color por defecto
    },
  },
};
</script>

<style lang="scss" scoped>
.stat-card {
  background-color: var(--bg-card);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  color: white;
  margin-right: 1rem;
}

.content {
  .title {
    font-size: 0.9rem;
    color: var(--text-main);
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .value {
    font-size: 1.75rem;
    font-weight: bold;
   
  }
}
</style>