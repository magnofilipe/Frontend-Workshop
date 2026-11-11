import { NewProject, Project } from '../types/project'

const API_URL = import.meta.env.VITE_API_URL

export async function listProjects(): Promise<Project[]> {
  const response = await fetch(`${API_URL}/projects`)

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao buscar projetos`)
  }

  return response.json()
}

export async function createProject(project: NewProject): Promise<Project> {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  })

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao criar projeto`)
  }

  return response.json()
}
