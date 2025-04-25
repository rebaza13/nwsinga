<template>
  <q-card class="todo-card">
    <q-card-section>
      <div class="row items-center justify-end q-mb-md">
        <q-btn flat round color="primary" icon="add" @click="showAddTask = true" />
      </div>

      <q-list separator>
        <q-item v-for="task in taskStore.tasks" :key="task.id" :class="{ 'done': task.done }" clickable
          @click="toggleTask(task.id as string)">
          <q-item-section avatar>
            <q-checkbox v-model="task.done" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label :class="{ 'text-strike': task.done }">{{ task.title }}</q-item-label>
            <div class="row items-center">
              <q-item-label caption class="q-mr-sm">{{ typeof task.due === 'string' ? task.due : new
                Date(task.due).toLocaleDateString() }}</q-item-label>
              <q-badge :color="task.priority === 'high' ? 'negative' : task.priority === 'medium' ? 'warning' : 'grey'"
                text-color="white" class="q-px-xs">
                {{ task.priority }}
              </q-badge>
            </div>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round dense color="red-5" icon="delete" @click.stop="removeTask(task.id as string)" />
          </q-item-section>
        </q-item>

        <q-item v-if="taskStore.tasks.length === 0" class="text-center text-grey q-py-md">
          <q-item-section>{{ $t('tasks.noTasks') }}</q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <!-- Add Task Dialog -->
    <q-dialog v-model="showAddTask">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('tasks.newTask') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="newTask.title" :label="$t('tasks.taskTitle')" autofocus @keyup.enter="addTask" />
          <q-input v-model="newTask.due" :label="$t('tasks.dueDate')" class="q-mt-md">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="newTask.due" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-select v-model="newTask.priority" :options="['low', 'medium', 'high']" :label="$t('tasks.priority')" class="q-mt-md">
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>
                    <q-badge :color="opt === 'high' ? 'negative' : opt === 'medium' ? 'warning' : 'grey'"
                      text-color="white" class="q-mr-sm">
                      {{ $t(`tasks.${opt}`) }}
                    </q-badge>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('app.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('tasks.addTask')" color="primary" @click="addTask" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTaskStore } from 'src/stores/task-store';
import type { Task } from 'src/models/property';

useI18n(); // Initialize i18n without extracting t

const taskStore = useTaskStore();
const showAddTask = ref(false);
const newTask = ref<Partial<Task>>({
  title: '',
  due: '',
  done: false,
  priority: 'medium'
});

onMounted(async () => {
  // Initialize with sample data if empty
  await taskStore.initializeWithSampleData();

  // Fetch tasks from Firestore
  await taskStore.fetchTasks();
});

async function addTask() {
  if (newTask.value.title?.trim()) {
    await taskStore.addTask({
      title: newTask.value.title,
      due: newTask.value.due || new Date().toISOString(),
      done: false,
      priority: newTask.value.priority || 'medium',
      createdAt: new Date()
    });

    // Reset form
    newTask.value = {
      title: '',
      due: '',
      done: false,
      priority: 'medium'
    };
  }
}

async function toggleTask(id: string) {
  await taskStore.toggleTaskStatus(id);
}

async function removeTask(id: string) {
  await taskStore.deleteTask(id);
}
</script>

<style lang="scss" scoped>
.todo-card {
  border-radius: 12px;

  .done {
    opacity: 0.7;
  }

  .q-item {
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }
  }
}

.body--dark {
  .q-item:hover {
    background-color: rgba(255, 255, 255, 0.07);
  }
}
</style>
