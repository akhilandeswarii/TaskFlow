
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export interface AuthResponse {
  message: string;
  token: string;
}

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(
    `${API_URL}/signup`,
    { name, email, password }
  );

  localStorage.setItem("token", response.data.token);
  return response.data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(
    `${API_URL}/login`,
    { email, password }
  );

  localStorage.setItem("token", response.data.token);
  return response.data;
}

export function logout(): void {
  localStorage.removeItem("token");
}
