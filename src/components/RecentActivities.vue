<template>
  <q-card class="recent-activities">
    <q-card-section>
      <q-timeline color="primary">
        <q-timeline-entry v-for="activity in activityStore.activities" :key="activity.id" :title="activity.title"
          :subtitle="typeof activity.date === 'string' ? new Date(activity.date).toLocaleDateString() : new Date(activity.date).toLocaleDateString()"
          :icon="activity.icon" :color="activity.color">
          <div>{{ activity.description }}</div>
        </q-timeline-entry>

        <div v-if="activityStore.activities.length === 0" class="text-center text-grey q-py-md">
          No recent activities to display.
        </div>
      </q-timeline>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useActivityStore } from 'src/stores/activity-store';

const activityStore = useActivityStore();

onMounted(async () => {
  // Initialize with sample data if empty
  await activityStore.initializeWithSampleData();

  // Fetch activities from Firestore
  await activityStore.fetchActivities();
});
</script>

<style lang="scss" scoped>
.recent-activities {
  border-radius: 12px;
}
</style>
