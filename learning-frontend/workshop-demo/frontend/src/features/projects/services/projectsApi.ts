import { Project } from '../types/project'

const API_URL = import.meta.env.VITE_API_URL

export async function listProjects(): Promise<Project[]> {
  const response = await fetch(`${API_URL}/projects`)

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao buscar projetos`)
  }

  return response.json()
}
