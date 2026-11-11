import { useState } from 'react'
import { deleteProject } from '../services/projectsApi'
import { Project } from '../types/project'

type DeleteProjectConfirmProps = {
  project: Project
  onDeleted: () => void
  onCancel: () => void
}

export function DeleteProjectConfirm({ project, onDeleted, onCancel }: DeleteProjectConfirmProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      await deleteProject(project.id)
      onDeleted()
    } catch {
      setError('Não foi possível apagar o projeto.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <p className="text-sm text-neutral-600">
        O projeto <strong>{project.title}</strong> será apagado. Esta ação não pode ser desfeita.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 active:scale-95"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apagar
        </button>
      </div>
    </div>
  )
}
