import { ProjectCard } from '../components/ProjectCard'
import { Project } from '../types/project'

const projects: Project[] = [
  {
    id: '1',
    title: 'Observatório do Mercado de Trabalho',
    description: 'Indicadores de emprego e renda por região.',
  },
  {
    id: '2',
    title: 'Avaliação do Ensino Médio',
    description: null,
  },
  {
    id: '3',
    title: 'Saúde Pública em Números',
    description: 'Dados do SUS consolidados por município.',
  },
]

export function ProjectsPage() {
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

      <ul className="flex flex-col gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} title={project.title} description={project.description} />
        ))}
      </ul>
    </main>
  )
}
