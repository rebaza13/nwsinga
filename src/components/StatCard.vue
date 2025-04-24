<template>
  <q-card class="stat-card" :class="[color, { 'animate-in': isVisible }]" ref="cardRef">
    <q-card-section>
      <div class="text-h6 text-white">{{ title }}</div>
      <div class="text-h3 text-white q-mt-sm q-mb-xs counter-value">{{ displayValue }}</div>
      <div class="text-caption text-white-8">
        <q-icon :name="icon" size="16px" class="q-mr-xs stat-icon" />
        <span>{{ subtitle }}</span>
      </div>
      </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const props = defineProps<{
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  icon: string;
}>();

const displayValue = computed(() => props.value);
const isVisible = ref(false);
const cardRef = ref(null);

onMounted(() => {
  // Add animation when component mounts
  setTimeout(() => {
    isVisible.value = true;
  }, 100);
});
</script>

<style lang="scss" scoped>
.stat-card {
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s, opacity 0.5s;
  opacity: 0;
  transform: translateY(20px);

  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
}

.counter-value {
  transition: all 0.3s ease;
}

.stat-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
