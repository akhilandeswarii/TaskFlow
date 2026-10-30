
import api from "./api";

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
}

export async function getProjects(): Promise<Project[]> {
  const response = await api.get<Project[]>("/projects");
  return response.data;
}

export async function createProject(
  project: Omit<Project, "id">
): Promise<Project> {
  const response = await api.post<Project>("/projects", project);
  return response.data;
}

export async function updateProject(
  id: number,
  project: Omit<Project, "id">
): Promise<Project> {
  const response = await api.put<Project>(`/projects/${id}`, project);
  return response.data;
}

export async function deleteProject(id: number): Promise<void> {
  await api.delete(`/projects/${id}`);
}
