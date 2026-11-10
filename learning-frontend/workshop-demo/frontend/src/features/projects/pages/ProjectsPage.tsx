import './ProjectsPage.css'

export function ProjectsPage() {
  return (
    <main className="projects-page">
      <header className="projects-header">
        <h1 className="projects-title">Projetos</h1>
        <button type="button" className="button-primary">
          Novo projeto
        </button>
      </header>

      <ul className="project-list">
        <li className="project-card">
          <h2 className="project-card-title">Observatório do Mercado de Trabalho</h2>
          <p className="project-card-description">Indicadores de emprego e renda por região.</p>
        </li>
        <li className="project-card">
          <h2 className="project-card-title">Avaliação do Ensino Médio</h2>
        </li>
        <li className="project-card">
          <h2 className="project-card-title">Saúde Pública em Números</h2>
          <p className="project-card-description">Dados do SUS consolidados por município.</p>
        </li>
      </ul>
    </main>
  )
}
