<script>
  import { tick } from 'svelte';

  // Svelte uses assignments to trigger compile-time reactivity updates without a Virtual DOM
  let tasks = [];
  let metric = null;
  let idCounter = 0;

  let taskName = '';
  let taskPriority = 'Medium';

  function startMeasure() {
    return performance.now();
  }

  async function endMeasure(op, start) {
    // tick returns a promise that resolves as soon as any pending state changes have been applied to the DOM
    await tick();
    setTimeout(() => {
      const end = performance.now();
      metric = { op, time: end - start };
    }, 0);
  }

  function generateTasks(count) {
    const newTasks = [];
    for (let i = 0; i < count; i++) {
      newTasks.push({ id: ++idCounter, name: `Task ${idCounter}`, priority: 'Medium' });
    }
    return newTasks;
  }

  async function addTask() {
    if (!taskName) return;
    const start = startMeasure();
    tasks = [{ id: ++idCounter, name: taskName, priority: taskPriority }, ...tasks];
    taskName = '';
    await endMeasure('add', start);
  }

  async function removeTask(id) {
    const start = startMeasure();
    tasks = tasks.filter(t => t.id !== id);
    await endMeasure('remove', start);
  }

  async function benchmarkRender(count) {
    const start = startMeasure();
    tasks = generateTasks(count);
    await endMeasure(`Render ${count}`, start);
  }

  async function benchmarkUpdate() {
    const start = startMeasure();
    tasks = tasks.map((t, i) => {
      if (i < 50) {
        return { ...t, name: t.name + ' (Updated)', priority: 'High' };
      }
      return t;
    });
    await endMeasure('Update 50', start);
  }

  async function benchmarkDelete() {
    const start = startMeasure();
    tasks = tasks.slice(50);
    await endMeasure('Delete 50', start);
  }

  async function updateTask() {
    const start = startMeasure();
    tasks = tasks; // Trigger update
    await endMeasure('update', start);
  }
</script>

<div class="App">
  <h1>Svelte To-Do Benchmark</h1>
  
  <div class="metrics">
    {#if metric}
      <p>Last operation (<b>{metric.op}</b>) took: <b>{metric.time.toFixed(2)} ms</b></p>
    {/if}
  </div>

  <div class="benchmarks">
    <button on:click={() => benchmarkRender(100)}>Render 100</button>
    <button on:click={() => benchmarkRender(500)}>Render 500</button>
    <button on:click={() => benchmarkRender(1000)}>Render 1000</button>
    <button on:click={benchmarkUpdate}>Update 50</button>
    <button on:click={benchmarkDelete}>Delete 50</button>
    <button on:click={() => tasks = []}>Clear</button>
  </div>

  <form on:submit|preventDefault={addTask} style="margin: 20px 0;">
    <input bind:value={taskName} placeholder="Task name" />
    <select bind:value={taskPriority}>
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select>
    <button type="submit">Add Task</button>
  </form>

  <ul>
    {#each tasks as task (task.id)}
      <li style="display: flex; gap: 10px; margin-bottom: 5px;">
        <input bind:value={task.name} on:input={updateTask} />
        <select bind:value={task.priority} on:change={updateTask}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button on:click={() => removeTask(task.id)}>Delete</button>
      </li>
    {/each}
  </ul>
</div>
