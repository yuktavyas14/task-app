import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

interface Task {
  id?: number;
  title: string;
  done: boolean;
}
type Filter = 'all' | 'active' | 'done';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private http = inject(HttpClient);
  api = 'https://task-app-api-j07t.onrender.com/api/tasks';

  tasks: Task[] = [];
  newTitle = '';
  filter: Filter = 'all';
  loading = true;
  error = '';
  today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  get doneCount() {
    return this.tasks.filter((t) => t.done).length;
  }
  get activeCount() {
    return this.tasks.length - this.doneCount;
  }
  get percent() {
    return this.tasks.length ? Math.round((this.doneCount / this.tasks.length) * 100) : 0;
  }
  get visibleTasks() {
    return this.tasks.filter(
      (t) => this.filter === 'all' || (this.filter === 'done' ? t.done : !t.done),
    );
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<Task[]>(this.api).subscribe({
      next: (t) => {
        this.tasks = t;
        this.loading = false;
        this.error = '';
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not reach the server. Check that Spring Boot is running on port 8080.';
      },
    });
  }

  add() {
    const title = this.newTitle.trim();
    if (!title) return;
    this.http.post<Task>(this.api, { title, done: false }).subscribe(() => {
      this.newTitle = '';
      this.load();
    });
  }

  toggle(t: Task) {
    this.http.put(`${this.api}/${t.id}`, {}).subscribe(() => this.load());
  }

  remove(t: Task) {
    this.http.delete(`${this.api}/${t.id}`).subscribe(() => this.load());
  }

  clearDone() {
    const done = this.tasks.filter((t) => t.done);
    if (!done.length) return;
    forkJoin(done.map((t) => this.http.delete(`${this.api}/${t.id}`))).subscribe(() => this.load());
  }
}
