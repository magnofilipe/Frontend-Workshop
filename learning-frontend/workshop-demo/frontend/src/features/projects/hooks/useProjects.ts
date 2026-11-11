import { useEffect, useState } from 'react'
import { listProjects } from '../services/projectsApi'
import { Project } from '../types/project'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        setProjects(await listProjects())
        setError(null)
      } catch {
        setError('Não foi possível carregar os projetos.')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [reloadCount])

  function reload() {
    setReloadCount((count) => count + 1)
  }

  return { projects, isLoading, error, reload }
}
