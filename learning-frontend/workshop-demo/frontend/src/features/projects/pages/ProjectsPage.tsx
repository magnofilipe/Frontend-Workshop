export function ProjectsPage() {
  // main:
  // mx-auto: margem automática nos dois lados, o que centraliza na horizontal
  // max-w-3xl = max-w-[768px]
  // flex flex-col: empilha os filhos
  // gap-6 = gap-[24px]
  // p-8 = p-[32px]
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      {/* flex: título e botão lado a lado; items-center: alinhados na vertical; justify-between: cada um numa ponta */}
      <header className="flex items-center justify-between">
        {/* text-2xl = text-[24px] leading-[32px] (tamanho da fonte e altura da linha)
            font-semibold = font-[600] */}
        <h1 className="text-2xl font-semibold">Projetos</h1>
        {/* rounded-lg = rounded-[8px]
            bg-primary = bg-[#FF856B] (cor definida no tailwind.config.ts)
            px-4 py-2 = px-[16px] py-[8px]
            text-sm = text-[14px] leading-[20px]
            font-medium = font-[500]
            hover:opacity-90 = hover:opacity-[0.9] (só com o mouse em cima) */}
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Novo projeto
        </button>
      </header>

      {/* gap-4 = gap-[16px] */}
      <ul className="flex flex-col gap-4">
        {/* border = border-[1px]
            border-neutral-300 = border-[#d4d4d4]
            p-4 = p-[16px]
            mt-1 = mt-[4px]
            text-neutral-500 = text-[#737373] */}
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
