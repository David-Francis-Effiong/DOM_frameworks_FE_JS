import { Component, ChangeDetectorRef, NgZone, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewChecked {
  tasks: any[] = [];
  metric: any = null;
  idCounter = 0;
  
  taskName = '';
  taskPriority = 'Medium';
  
  private startTime = 0;
  private operation = '';
  private waitingForRender = false;

  constructor(private cdRef: ChangeDetectorRef, private zone: NgZone) {}

  // Angular relies on two-way data binding and change detection mechanism via Zone.js.
  // ngAfterViewChecked lifecycle hook is used here to measure when the DOM updates are finished.
  ngAfterViewChecked() {
    if (this.waitingForRender) {
      this.waitingForRender = false;
      setTimeout(() => {
        const end = performance.now();
        this.metric = { op: this.operation, time: end - this.startTime };
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  startMeasure(op: string) {
    this.operation = op;
    this.startTime = performance.now();
    this.waitingForRender = true;
  }

  generateTasks(count: number) {
    const newTasks = [];
    for (let i = 0; i < count; i++) {
      newTasks.push({ id: ++this.idCounter, name: `Task ${this.idCounter}`, priority: 'Medium' });
    }
    return newTasks;
  }

  addTask() {
    if (!this.taskName) return;
    this.startMeasure('add');
    this.tasks.unshift({ id: ++this.idCounter, name: this.taskName, priority: this.taskPriority });
    this.taskName = '';
  }

  removeTask(id: number) {
    this.startMeasure('remove');
    this.tasks = this.tasks.filter(t => t.id !== id);
  }

  updateTask(id: number, field: string, value: string) {
    this.startMeasure(`update ${field}`);
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task[field] = value;
    }
  }

  benchmarkRender(count: number) {
    this.startMeasure(`Render ${count}`);
    this.tasks = this.generateTasks(count);
  }

  benchmarkUpdate() {
    this.startMeasure('Update 50');
    for (let i = 0; i < Math.min(50, this.tasks.length); i++) {
      this.tasks[i].name += ' (Updated)';
      this.tasks[i].priority = 'High';
    }
  }

  benchmarkDelete() {
    this.startMeasure('Delete 50');
    this.tasks = this.tasks.slice(50);
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }
}
