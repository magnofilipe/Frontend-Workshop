import { ProjectCard } from '../components/ProjectCard'
import { useProjects } from '../hooks/useProjects'

export function ProjectsPage() {
  const { projects, isLoading, error } = useProjects()

  function renderContent() {
    if (isLoading) {
      return <p className="text-sm text-neutral-500">Carregando projetos...</p>
    }

    if (error) {
      return <p className="text-sm text-red-600">{error}</p>
    }

    if (projects.length === 0) {
      return <p className="text-sm text-neutral-500">Nenhum projeto cadastrado.</p>
    }

    return (
      <ul className="flex flex-col gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} title={project.title} description={project.description} />
        ))}
      </ul>
    )
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projetos</h1>
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 active:scale-95"
        >
          Novo projeto
        </button>
      </header>

      {renderContent()}
    </main>
  )
}
