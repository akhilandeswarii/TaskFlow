
package com.taskflow.backend.controller;

import com.taskflow.backend.entity.Project;
import com.taskflow.backend.entity.Task;
import com.taskflow.backend.entity.User;
import com.taskflow.backend.repository.ProjectRepository;
import com.taskflow.backend.repository.TaskRepository;
import com.taskflow.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskController(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    private User getLoggedInUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
    }

    @GetMapping
    public List<Task> getTasks(Authentication authentication) {
        User user = getLoggedInUser(authentication);
        return taskRepository.findByUserId(user.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task createTask(
            @RequestBody Task task,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        task.setId(null);
        task.setUser(user);

        if (task.getProject() != null && task.getProject().getId() != null) {
            Project project = projectRepository.findById(task.getProject().getId())
                    .filter(p -> p.getUser().getId().equals(user.getId()))
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Project not found"));

            task.setProject(project);
        } else {
            task.setProject(null);
        }

        return taskRepository.save(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(
            @PathVariable Long id,
            @RequestBody Task updatedTask,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Task task = taskRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Task not found"));

        task.setTitle(updatedTask.getTitle());
        task.setDescription(updatedTask.getDescription());
        task.setPriority(updatedTask.getPriority());
        task.setStatus(updatedTask.getStatus());
        task.setDueDate(updatedTask.getDueDate());

        if (updatedTask.getProject() != null
                && updatedTask.getProject().getId() != null) {

            Project project = projectRepository
                    .findById(updatedTask.getProject().getId())
                    .filter(p -> p.getUser().getId().equals(user.getId()))
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Project not found"));

            task.setProject(project);
        } else {
            task.setProject(null);
        }

        return taskRepository.save(task);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(
            @PathVariable Long id,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Task task = taskRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Task not found"));

        taskRepository.delete(task);
    }
}
