import React, { useState, useRef, useEffect } from 'react';
import './App.css';

let idCounter = 0;
const generateTasks = (count) => {
  const newTasks = [];
  for (let i = 0; i < count; i++) {
    newTasks.push({
      id: ++idCounter,
      name: `Task ${idCounter}`,
      priority: 'Medium'
    });
  }
  return newTasks;
};

function App() {
  // React uses state to manage data and Virtual DOM to compute changes efficiently
  const [tasks, setTasks] = useState([]);
  const [metric, setMetric] = useState(null);
  
  const startTime = useRef(0);
  const operation = useRef(null);

  const startMeasure = (opName) => {
    operation.current = opName;
    startTime.current = performance.now();
  };

  // We use useEffect in combination with requestAnimationFrame and setTimeout 
  // to ensure we only measure the time after React has committed changes to the DOM and the browser has painted
  useEffect(() => {
    if (operation.current) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const end = performance.now();
          setMetric({
            op: operation.current,
            time: end - startTime.current
          });
          operation.current = null;
        }, 0);
      });
    }
  });

  const addTask = (e) => {
    e.preventDefault();
    const name = e.target.elements.name.value;
    const priority = e.target.elements.priority.value;
    if (!name) return;
    
    startMeasure('add');
    // Updating state triggers a re-render
    setTasks([{ id: ++idCounter, name, priority }, ...tasks]);
    e.target.reset();
  };

  const removeTask = (id) => {
    startMeasure('remove');
    // Filtering state triggers a re-render without mutating existing array
    setTasks(tasks.filter(t => t.id !== id));
  };

  const updateTask = (id, newName, newPriority) => {
    startMeasure('update');
    // Mapping state updates specific tasks
    setTasks(tasks.map(t => (t.id === id ? { ...t, name: newName, priority: newPriority } : t)));
  };

  const benchmarkRender = (count) => {
    startMeasure(`Render ${count}`);
    setTasks(generateTasks(count));
  };

  const benchmarkUpdate = () => {
    startMeasure('Update 50');
    setTasks(prev => {
      const copy = [...prev];
      for (let i = 0; i < Math.min(50, copy.length); i++) {
        copy[i] = { ...copy[i], name: copy[i].name + ' (Updated)', priority: 'High' };
      }
      return copy;
    });
  };

  const benchmarkDelete = () => {
    startMeasure('Delete 50');
    setTasks(prev => prev.slice(50));
  };

  return (
    <div className="App">
      <h1>React To-Do Benchmark</h1>
      
      <div className="metrics">
        {metric && <p>Last operation (<b>{metric.op}</b>) took: <b>{metric.time.toFixed(2)} ms</b></p>}
      </div>

      <div className="benchmarks">
        <button onClick={() => benchmarkRender(100)}>Render 100</button>
        <button onClick={() => benchmarkRender(500)}>Render 500</button>
        <button onClick={() => benchmarkRender(1000)}>Render 1000</button>
        <button onClick={benchmarkUpdate}>Update 50</button>
        <button onClick={benchmarkDelete}>Delete 50</button>
        <button onClick={() => setTasks([])}>Clear</button>
      </div>

      <form onSubmit={addTask} style={{ margin: '20px 0' }}>
        <input name="name" placeholder="Task name" />
        <select name="priority" defaultValue="Medium">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
            <input 
              value={task.name} 
              onChange={(e) => updateTask(task.id, e.target.value, task.priority)} 
            />
            <select 
              value={task.priority} 
              onChange={(e) => updateTask(task.id, task.name, e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button onClick={() => removeTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
