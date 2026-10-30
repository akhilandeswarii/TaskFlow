
import api from "./api";

export interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number | null;
  priority: string;
  status: string;
  dueDate: string;
}

interface TaskRequest {
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string | null;
  project: { id: number } | null;
}

export async function getTasks(): Promise<Task[]> {
  const response = await api.get("/tasks");

  return response.data.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    projectId: task.project?.id ?? null,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ?? "",
  }));
}

export async function createTask(task: TaskRequest) {
  return api.post("/tasks", task);
}

export async function updateTask(id: number, task: TaskRequest) {
  return api.put(`/tasks/${id}`, task);
}

export async function deleteTask(id: number) {
  return api.delete(`/tasks/${id}`);
}
