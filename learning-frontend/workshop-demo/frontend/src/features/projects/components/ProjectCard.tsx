import { Trash2 } from 'lucide-react'

type ProjectCardProps = {
  title: string
  description: string | null
}

export function ProjectCard({ title, description }: ProjectCardProps) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-lg border border-neutral-300 bg-white p-4 transition-colors hover:bg-[#FFF8F5]">
      <div>
        <h2 className="font-medium">{title}</h2>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      <button
        type="button"
        aria-label={`Apagar ${title}`}
        className="text-neutral-500 transition hover:text-red-600 active:scale-95"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </li>
  )
}
