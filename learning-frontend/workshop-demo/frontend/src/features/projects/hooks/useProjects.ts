import { useEffect, useState } from 'react'
import { listProjects } from '../services/projectsApi'
import { Project } from '../types/project'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setProjects(await listProjects())
      } catch {
        setError('Não foi possível carregar os projetos.')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  return { projects, isLoading, error }
}
