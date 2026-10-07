<script setup>
import { ref, nextTick } from 'vue';

// Vue uses a reactive system (Composition API with refs) to track dependencies
const tasks = ref([]);
const metric = ref(null);
let idCounter = 0;

const startMeasure = () => {
  return performance.now();
};

const endMeasure = async (op, start) => {
  // nextTick ensures we wait until Vue has updated the DOM before taking the final timestamp
  await nextTick();
  setTimeout(() => {
    const end = performance.now();
    metric.value = { op, time: end - start };
  }, 0);
};

const generateTasks = (count) => {
  const newTasks = [];
  for (let i = 0; i < count; i++) {
    newTasks.push({ id: ++idCounter, name: `Task ${idCounter}`, priority: 'Medium' });
  }
  return newTasks;
};

const addTask = async (e) => {
  const name = e.target.elements.name.value;
  const priority = e.target.elements.priority.value;
  if (!name) return;
  const start = startMeasure();
  tasks.value.unshift({ id: ++idCounter, name, priority });
  e.target.reset();
  await endMeasure('add', start);
};

const removeTask = async (id) => {
  const start = startMeasure();
  tasks.value = tasks.value.filter(t => t.id !== id);
  await endMeasure('remove', start);
};

const updateTaskName = async (id, name) => {
  const start = startMeasure();
  const task = tasks.value.find(t => t.id === id);
  if (task) task.name = name;
  await endMeasure('update name', start);
};

const updateTaskPriority = async (id, priority) => {
  const start = startMeasure();
  const task = tasks.value.find(t => t.id === id);
  if (task) task.priority = priority;
  await endMeasure('update priority', start);
};

const benchmarkRender = async (count) => {
  const start = startMeasure();
  tasks.value = generateTasks(count);
  await endMeasure(`Render ${count}`, start);
};

const benchmarkUpdate = async () => {
  const start = startMeasure();
  for (let i = 0; i < Math.min(50, tasks.value.length); i++) {
    tasks.value[i].name += ' (Updated)';
    tasks.value[i].priority = 'High';
  }
  await endMeasure('Update 50', start);
};

const benchmarkDelete = async () => {
  const start = startMeasure();
  tasks.value = tasks.value.slice(50);
  await endMeasure('Delete 50', start);
};
</script>

<template>
  <div class="App">
    <h1>Vue To-Do Benchmark</h1>
    
    <div class="metrics">
      <p v-if="metric">Last operation (<b>{{ metric.op }}</b>) took: <b>{{ metric.time.toFixed(2) }} ms</b></p>
    </div>

    <div class="benchmarks">
      <button @click="benchmarkRender(100)">Render 100</button>
      <button @click="benchmarkRender(500)">Render 500</button>
      <button @click="benchmarkRender(1000)">Render 1000</button>
      <button @click="benchmarkUpdate">Update 50</button>
      <button @click="benchmarkDelete">Delete 50</button>
      <button @click="tasks = []">Clear</button>
    </div>

    <form @submit.prevent="addTask" style="margin: 20px 0;">
      <input name="name" placeholder="Task name" />
      <select name="priority">
        <option value="Low">Low</option>
        <option value="Medium" selected>Medium</option>
        <option value="High">High</option>
      </select>
      <button type="submit">Add Task</button>
    </form>

    <ul>
      <li v-for="task in tasks" :key="task.id" style="display: flex; gap: 10px; margin-bottom: 5px;">
        <input :value="task.name" @input="e => updateTaskName(task.id, e.target.value)" />
        <select :value="task.priority" @change="e => updateTaskPriority(task.id, e.target.value)">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button @click="removeTask(task.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>
