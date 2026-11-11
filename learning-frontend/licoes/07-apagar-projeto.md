# Lição 07: apagar um projeto

A lixeira de cada card abre um modal de confirmação, no mesmo estilo do modal de criação. Ao confirmar, o projeto é apagado no backend por DELETE e a lista é buscada de novo.

| Arquivo | O que mudou |
|---|---|
| `features/projects/components/ProjectCard.tsx` | Recebe `onDelete` e o chama no clique da lixeira |
| `features/projects/components/DeleteProjectConfirm.tsx` | Novo. O texto de confirmação e os botões "Cancelar" e "Apagar" |
| `features/projects/services/projectsApi.ts` | Ganhou `deleteProject`, que faz o DELETE |
| `features/projects/pages/ProjectsPage.tsx` | Guarda qual projeto vai ser apagado e abre o modal |
| `shared/components/Modal.tsx` | Nada. O mesmo `Modal` da etapa 5 é reutilizado |

## 1. Qual projeto apagar: um estado com o projeto

No modal de criação, bastava saber se ele estava aberto, então o estado era `true` ou `false`. No modal de confirmação, a página precisa saber também **qual** projeto vai ser apagado, para mostrar o título dele e enviar o `id` no DELETE. Por isso o estado guarda o próprio projeto:

```tsx
const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
```

- **`null`** quer dizer que nenhum projeto foi escolhido, e o modal está fechado.
- **Um `Project`** quer dizer que esse projeto foi escolhido, e o modal está aberto para ele.

Um estado só responde às duas perguntas, "está aberto?" e "para qual projeto?". Com dois estados separados, um para aberto e outro para o projeto, seria possível chegar a combinações sem sentido, como o modal aberto sem nenhum projeto escolhido.

O modal é desenhado quando `projectToDelete` tem um projeto:

```tsx
{projectToDelete && (
  <Modal title="Apagar projeto" onClose={() => setProjectToDelete(null)}>
    <DeleteProjectConfirm
      project={projectToDelete}
      onDeleted={handleDeleted}
      onCancel={() => setProjectToDelete(null)}
    />
  </Modal>
)}
```

O `&&` funciona aqui como na descrição do card (lição 04): com `null`, nada é desenhado, e com um objeto, o modal é desenhado.

## 2. O clique na lixeira sobe do card para a página

O card não sabe apagar projetos nem abrir modais. Ele só avisa que a lixeira foi clicada, do mesmo jeito que o `Modal` avisa com `onClose`:

```tsx
type ProjectCardProps = {
  title: string
  description: string | null
  onDelete: () => void
}

<button type="button" aria-label={`Apagar ${title}`} onClick={onDelete}>
```

Quem decide o que acontece é a página, que passa a função dentro do `.map`:

```tsx
{projects.map((project) => (
  <ProjectCard
    key={project.id}
    title={project.title}
    description={project.description}
    onDelete={() => setProjectToDelete(project)}
  />
))}
```

O `.map` executa a arrow function uma vez para cada projeto, e em cada execução `project` é um projeto diferente. A função `() => setProjectToDelete(project)` criada em cada execução usa o `project` daquela execução. Assim, cada card recebe um `onDelete` que já sabe qual é o seu projeto.

O que acontece ao clicar na lixeira do segundo card:

1. O botão chama `onDelete()`, que é a função criada para o segundo projeto.
2. Ela executa `setProjectToDelete(project)`, com o segundo projeto.
3. O React renderiza a página de novo. `projectToDelete` agora tem um projeto, então o `&&` desenha o modal.
4. O `DeleteProjectConfirm` recebe esse projeto e mostra o título dele.

## 3. O mesmo `Modal`, outro conteúdo

O `Modal.tsx` não mudou nesta etapa. A página o usa duas vezes, com títulos e conteúdos diferentes:

| Uso | `title` | `children` | `onClose` |
|---|---|---|---|
| Criação | "Novo projeto" | `<NewProjectForm ... />` | `() => setIsCreating(false)` |
| Exclusão | "Apagar projeto" | `<DeleteProjectConfirm ... />` | `() => setProjectToDelete(null)` |

O fundo escuro, a caixa branca e o fechamento com clique fora vieram de graça. Esse é o resultado de o `Modal` não saber nada de projetos: ele recebe tudo o que é específico por props e `children`.

## 4. `DeleteProjectConfirm`

```tsx
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
```

A estrutura é a mesma do `handleSubmit` da etapa 5b:
- **`isDeleting`** desabilita o botão "Apagar" enquanto o DELETE não termina;
- **`error`** mostra a mensagem se o DELETE falhar;
- **`onDeleted`** avisa a página de que deu certo.

Duas diferenças em relação ao formulário:
- **Não há `<form>`.** Não existe nenhum campo para preencher, só uma confirmação. Por isso o botão "Apagar" é `type="button"` com `onClick`, e não há `preventDefault`.
- **O botão "Apagar" é vermelho (`bg-red-600`).** Ações que não podem ser desfeitas costumam ter cor própria, para que o usuário não as confunda com uma ação comum.

`<strong>` destaca o título do projeto no texto. É uma tag com significado, "isto é importante", e o navegador a mostra em negrito.

## 5. `deleteProject`

```ts
export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' })

  if (!response.ok && response.status !== 404) {
    throw new Error(`Erro ${response.status} ao apagar projeto`)
  }
}
```

- **`${id}` no endereço:** a rota do contrato é `DELETE /projects/{id}`, então o `id` entra no próprio endereço, e não no corpo. O pedido sai como `DELETE http://localhost:8000/projects/3f2b9c1e-...`.
- **`Promise<void>`:** a função não devolve nenhum valor. O backend responde 204 (No Content), que quer dizer "deu certo, e não há corpo". Por isso não existe `return response.json()`: chamar `.json()` numa resposta sem corpo lança o erro `Unexpected end of JSON input`.
- **`response.status !== 404`:** o backend responde 404 quando o projeto não existe, por exemplo porque já foi apagado em outra aba. O objetivo do usuário era que o projeto deixasse de existir, e ele já não existe. Por isso o 404 não é tratado como erro: a função termina normalmente, a página fecha o modal e busca a lista, que já vem sem o projeto. A condição se lê "se a resposta não estiver ok **e** o status não for 404, lance o erro".

## 6. A lista depois do DELETE

```tsx
function handleDeleted() {
  setProjectToDelete(null)
  reload()
}
```

É o mesmo caminho do `handleCreated`: o modal fecha, e o `reload` soma 1 ao `reloadCount`, o que faz o efeito do `useProjects` buscar a lista de novo.

A lista nova chega com um projeto a menos. Aqui a `key` da lição 04 faz diferença. O React compara os `id` da lista nova com os da anterior, vê que um deles sumiu e remove só o `li` daquele projeto. Os outros cards continuam os mesmos elementos da página. Sem a `key`, o React compararia pela posição e reaproveitaria os elementos na ordem, alterando o conteúdo de cada card abaixo do apagado.

O que acontece ao clicar em "Apagar":

1. `handleDelete` envia o DELETE e espera a resposta 204.
2. O `DeleteProjectConfirm` chama `onDeleted()`, que é o `handleDeleted` da página.
3. `handleDeleted` chama `setProjectToDelete(null)`, e o modal sai da tela.
4. `handleDeleted` chama `reload()`, e um novo GET é enviado.
5. A lista chega sem o projeto, e o React remove o card dele.

## 7. Ver na aba Network

Ao apagar um projeto, aparecem três pedidos:

| Pedido | Status | O que é |
|---|---|---|
| `OPTIONS /projects/{id}` | 200 | O navegador pergunta ao backend se a página pode enviar um DELETE (CORS) |
| `DELETE /projects/{id}` | 204 | A exclusão |
| `GET /projects` | 200 | A lista buscada de novo |

Para ver o 404 tratado como sucesso: abra a demo em duas abas, apague um projeto na primeira e, na segunda, sem recarregar, tente apagar o mesmo projeto. O DELETE responde 404, o modal fecha e a lista se atualiza.

## A demo completa

```
src/
├── index.css
├── app/
│   ├── main.tsx
│   └── App.tsx
├── features/projects/
│   ├── pages/ProjectsPage.tsx
│   ├── components/ProjectCard.tsx
│   ├── components/NewProjectForm.tsx
│   ├── components/DeleteProjectConfirm.tsx
│   ├── hooks/useProjects.ts
│   ├── services/projectsApi.ts
│   └── types/project.ts
└── shared/
    └── components/Modal.tsx
```

## Commit

```
feat: delete projects from a confirmation modal that reuses the shared modal, sends a DELETE and reloads the list
```
