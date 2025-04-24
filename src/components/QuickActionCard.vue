<template>
  <q-card class="text-white quick-action-card" :class="bgColor" @click="handleClick">
    <q-card-section class="text-center">
      <q-icon :name="icon" size="3rem" class="card-icon" :class="{ 'animate-icon': isAnimating }" />
      <div class="text-subtitle1 q-mt-sm">{{ title }}</div>
    </q-card-section>
    <div class="ripple-container">
      <div class="ripple" :class="{ 'active': isRippling }"></div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  title: string;
  icon: string;
  bgColor: string;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const isAnimating = ref(false);
const isRippling = ref(false);

function handleClick() {
  // Trigger the icon animation
  isAnimating.value = true;

  // Trigger the ripple effect
  isRippling.value = true;

  // Reset animations after they complete
  setTimeout(() => {
    isAnimating.value = false;
    isRippling.value = false;
  }, 600);

  // Emit the click event
  emit('click');
}
</script>

<style lang="scss" scoped>
.quick-action-card {
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.98);
  }
}

// Icon animation
.card-icon {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.animate-icon {
    animation: bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

@keyframes bounce {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }
}

// Ripple effect
.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  opacity: 0;

  &.active {
    animation: ripple-effect 0.6s ease-out forwards;
  }
}

@keyframes ripple-effect {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }

  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}
</style>
