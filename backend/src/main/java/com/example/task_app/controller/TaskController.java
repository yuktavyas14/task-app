package com.example.task_app.controller;   // ← keep YOUR package name
import com.example.task_app.entity.Task;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final List<Task> tasks = new CopyOnWriteArrayList<>();
    private final AtomicLong nextId = new AtomicLong(1);

    public TaskController() {
        // a few starter tasks so the list isn't empty
        tasks.add(new Task(nextId.getAndIncrement(), "Learn Spring Boot", true));
        tasks.add(new Task(nextId.getAndIncrement(), "Build the Angular UI", false));
        tasks.add(new Task(nextId.getAndIncrement(), "Deploy the app", false));
    }

    @GetMapping
    public List<Task> all() {
        return tasks;
    }

    @PostMapping
    public Task create(@RequestBody Task task) {
        task.setId(nextId.getAndIncrement());
        tasks.add(task);
        return task;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> toggle(@PathVariable Long id) {
        for (Task t : tasks) {
            if (t.getId().equals(id)) {
                t.setDone(!t.isDone());
                return ResponseEntity.ok(t);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        tasks.removeIf(t -> t.getId().equals(id));
    }
}