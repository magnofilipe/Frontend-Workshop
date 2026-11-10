export function ProjectsPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projetos</h1>
        <button
          type="button"
          className="rounded-lg bg-[#FF856B] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Novo projeto
        </button>
      </header>

      <ul className="flex flex-col gap-4">
        <li className="rounded-lg border border-neutral-300 bg-white p-4">
          <h2 className="font-medium">Observatório do Mercado de Trabalho</h2>
          <p className="mt-1 text-sm text-neutral-500">Indicadores de emprego e renda por região.</p>
        </li>
        <li className="rounded-lg border border-neutral-300 bg-white p-4">
          <h2 className="font-medium">Avaliação do Ensino Médio</h2>
        </li>
        <li className="rounded-lg border border-neutral-300 bg-white p-4">
          <h2 className="font-medium">Saúde Pública em Números</h2>
          <p className="mt-1 text-sm text-neutral-500">Dados do SUS consolidados por município.</p>
        </li>
      </ul>
    </main>
  )
}
