<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// Set up viewport meta tag for mobile devices
onMounted(() => {
  // Add viewport-fit=cover for iOS safe area support
  const metaViewport = document.createElement('meta');
  metaViewport.name = 'viewport';
  metaViewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  document.head.appendChild(metaViewport);
});
</script>
