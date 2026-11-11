import { FormEvent, useEffect, useRef, useState } from 'react'

type NewProjectFormProps = {
  onCancel: () => void
}

export function NewProjectForm({ onCancel }: NewProjectFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleInputRef.current?.focus()
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  const canSubmit = title.trim() !== ''

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Título
        <input
          ref={titleInputRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 font-normal focus:border-primary focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Descrição (opcional)
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="rounded-lg border border-neutral-300 px-3 py-2 font-normal focus:border-primary focus:outline-none"
        />
      </label>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 active:scale-95"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Criar
        </button>
      </div>
    </form>
  )
}
