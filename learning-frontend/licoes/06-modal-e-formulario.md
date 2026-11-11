# Lição 06: modal de criação e POST

A etapa tem dois commits:
- **5a:** o botão "Novo projeto" abre um modal com o formulário. O modal fecha com "Cancelar" e com clique fora. O botão "Criar" fica desabilitado com título vazio, mas ainda não envia nada.
- **5b:** o "Criar" envia o projeto ao backend por POST, mostra erro se falhar e, se der certo, fecha o modal e busca a lista de novo.

# Etapa 5a: o modal e o formulário

| Arquivo | O que mudou |
|---|---|
| `shared/components/Modal.tsx` | Novo. O modal genérico: fundo escuro, caixa branca, fecha com clique fora |
| `features/projects/components/NewProjectForm.tsx` | Novo. O formulário, ainda sem envio |
| `features/projects/pages/ProjectsPage.tsx` | Abre e fecha o modal |

## 1. Abrir e fechar: estado e renderização condicional

Se o modal está aberto ou fechado é uma informação que muda com o tempo, então ela fica num estado da página:

```tsx
const [isCreating, setIsCreating] = useState(false)
```

O modal só é desenhado quando `isCreating` é `true`, com o mesmo `&&` da descrição do card:

```tsx
{isCreating && (
  <Modal title="Novo projeto" onClose={() => setIsCreating(false)}>
    <NewProjectForm onCancel={() => setIsCreating(false)} />
  </Modal>
)}
```

Quando `isCreating` é `false`, o modal não existe na página. Ele não está escondido por CSS: o React simplesmente não cria os elementos dele. Quando passa a `true`, o React cria o modal e o formulário do zero, com campos vazios.

O modal fica no fim do `main`, depois da lista. Como ele tem `fixed inset-0`, cobre a janela inteira onde quer que esteja. No fim, ele também fica por cima de tudo sem `z-index`, porque, entre elementos posicionados, o que vem depois no HTML é desenhado por cima.

### `onClick` recebe uma função

```tsx
<button type="button" onClick={() => setIsCreating(true)}>
```

`onClick` precisa receber uma **função**, que o React chama quando o botão for clicado. `() => setIsCreating(true)` é uma arrow function que, quando chamada, executa `setIsCreating(true)`.

Escrever `onClick={setIsCreating(true)}`, sem o `() =>`, não funciona. Nesse caso, `setIsCreating(true)` é executado **durante a renderização**, e não no clique. Ele troca o estado, o que provoca outra renderização, que o executa de novo, e assim por diante. O React interrompe o ciclo com o erro `Too many re-renders`.

## 2. `Modal`: um componente que envolve outro conteúdo

O modal de criação e o modal de confirmação da etapa 6 têm a mesma aparência e o mesmo comportamento, e só o conteúdo de dentro muda. Por isso o `Modal` não sabe nada de projetos e fica em `shared/components`.

### `children`

Tudo o que é escrito entre a tag de abertura e a de fechamento de um componente chega a ele numa prop chamada `children`:

```tsx
<Modal title="Novo projeto" onClose={...}>
  <NewProjectForm ... />
</Modal>
```

Aqui o `Modal` recebe três props: `title`, `onClose` e `children`, que contém o `<NewProjectForm ... />`. Dentro do `Modal`, `{children}` coloca esse conteúdo no lugar desejado:

```tsx
<div role="dialog" ...>
  <h2>{title}</h2>
  {children}
</div>
```

O conteúdo pode ser qualquer coisa. Aqui é um formulário, e na etapa 6 vai ser um texto com dois botões. O type de `children` é `ReactNode`, que o React exporta e que significa "qualquer coisa que o React consegue desenhar": tags, componentes, textos, números ou `null`.

### Funções como props: `onClose`

```ts
type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
}
```

`onClose: () => void` é o **type** da prop: uma função que não recebe nada e não devolve valor (`void` significa "nenhum valor"). Não devolver valor não quer dizer não fazer nada: a função executa o que tiver dentro dela, só não tem um `return` com resultado.

A função de verdade é escrita por quem usa o `Modal`. A página passa `() => setIsCreating(false)`. O `Modal` não sabe o que fechar significa: ele só chama `onClose()` quando o usuário clica fora.

O caminho completo do clique fora:

1. O usuário pressiona o mouse no fundo escuro, e o React chama o `handleBackdropMouseDown`, que está no `Modal`.
2. O `handleBackdropMouseDown` chama `onClose()`, que é a função que a página passou.
3. Essa função executa `setIsCreating(false)`.
4. O React renderiza a página de novo. `isCreating && ...` agora dá `false`, então o modal não é desenhado e sai da tela.

A dependência entre os dois arquivos vai num sentido só. A página importa o `Modal` e entrega a ele o que ele precisa por props, mas o `Modal` não importa nada da página. Quem decide se o modal está aberto é a página, porque é ela que tem o botão que o abre. Esse é o caminho padrão para um componente filho avisar o pai de que algo aconteceu: o pai passa uma função por props, e o filho a chama.

### Posicionamento

```tsx
<div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
  <div className="w-full max-w-md rounded-lg bg-white p-6">
```

- **`fixed inset-0`** (`position: fixed; top: 0; right: 0; bottom: 0; left: 0`) faz a primeira `div` ocupar a janela inteira, por cima da página, parada mesmo se a página rolar.
- **`bg-black/50`** é preto com 50% de opacidade, o fundo escuro.
- **`flex items-center justify-center`** centraliza a caixa branca.
- **`w-full max-w-md`** faz a caixa ocupar a largura disponível, até 448px.

## 3. Fechar clicando fora

```tsx
function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
  if (event.target === event.currentTarget) {
    onClose()
  }
}

<div className="fixed inset-0 ..." onMouseDown={handleBackdropMouseDown}>
```

O React chama a função do evento passando um objeto `event` com informações sobre o que aconteceu. Dois campos importam aqui:
- **`event.currentTarget`** é o elemento que tem o `onMouseDown`, ou seja, o fundo escuro.
- **`event.target`** é o elemento exato em que o mouse foi pressionado.

Um clique dentro da caixa branca também chega ao `onMouseDown` do fundo, porque eventos sobem do elemento clicado para todos os elementos que o contêm. Por isso a comparação: o modal só fecha quando o elemento pressionado **é o próprio fundo**, e não algo dentro dele.

**Por que `onMouseDown` e não `onClick`.** Um clique é o par "pressionar e soltar". Se o usuário pressionar o mouse dentro do campo de título para selecionar o texto e soltar fora da caixa, o navegador considera que o clique aconteceu no fundo, e um `onClick` fecharia o modal no meio da seleção. Com `onMouseDown`, só conta onde o mouse foi pressionado.

## 4. Inputs controlados

```tsx
const [title, setTitle] = useState('')

<input value={title} onChange={(event) => setTitle(event.target.value)} />
```

Um input **controlado** é aquele cujo valor vem do estado do React:

- **`value={title}`** diz que o campo mostra exatamente o que está em `title`.
- **`onChange`** é chamado a cada tecla digitada. `event.target` é o próprio input, e `event.target.value` é o texto que o campo teria depois da tecla.

O que acontece quando o usuário digita "S":
1. O navegador dispara o `onChange`, com `event.target.value` igual a `"S"`.
2. `setTitle("S")` troca o estado, e o React renderiza o formulário de novo.
3. O input é desenhado com `value="S"`.

Com `value` e sem `onChange`, o campo fica travado: a cada tecla, o React desenha de novo o mesmo `value` do estado, que nunca muda. O console avisa `You provided a value prop to a form field without an onChange handler`.

O motivo de controlar o input é que o texto passa a estar no estado, disponível para o resto do componente: para habilitar o botão "Criar" e, na 5b, para enviar ao backend.

## 5. Botão "Criar" desabilitado

```tsx
const canSubmit = title.trim() !== ''

<button type="submit" disabled={!canSubmit} className="... disabled:cursor-not-allowed disabled:opacity-50">
```

- **`title.trim()`** devolve o texto sem espaços no começo e no fim. Um título só com espaços vira `''`.
- **`!==`** verifica se dois valores são diferentes.
- **`disabled={!canSubmit}`** desabilita o botão quando não é possível enviar.

`canSubmit` é uma variável comum, não um estado, porque é calculada a partir de um estado que já existe. A cada renderização, ou seja, a cada tecla digitada, ela é calculada de novo com o valor atual de `title`.

O backend também recusa títulos vazios (lição 00). O botão desabilitado serve para avisar o usuário, e a garantia é a validação do backend.

## 6. Enviar: `onSubmit` e `preventDefault`

```tsx
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
}

<form onSubmit={handleSubmit}>
```

O `onSubmit` do formulário é chamado quando o botão `type="submit"` é clicado e também quando o usuário aperta Enter dentro do campo de título. O botão "Cancelar" é `type="button"` para não enviar o formulário (lição 02).

Por padrão, ao enviar um `<form>`, o navegador recarrega a página, porque formulários foram criados para mandar dados ao servidor e carregar uma página nova. `event.preventDefault()` cancela esse comportamento padrão. Nesta etapa, o `handleSubmit` só faz isso, e o "Criar" não tem efeito. Sem essa linha, clicar em "Criar" recarregaria a página inteira. Na 5b, o `handleSubmit` passa a enviar o projeto.

## 7. Foco no título: `useRef`

```tsx
const titleInputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  titleInputRef.current?.focus()
}, [])

<input ref={titleInputRef} ... />
```

Para dar foco a um campo, é preciso chamar o método `.focus()` do elemento real da página. O JSX descreve o que mostrar, mas não dá acesso direto aos elementos criados. São três peças:

| Linha | O que faz |
|---|---|
| `const titleInputRef = useRef<HTMLInputElement>(null)` | Cria a referência, que começa vazia |
| `<input ref={titleInputRef} ... />` | Pede ao React para guardar o elemento real do input em `titleInputRef.current` |
| `useEffect(() => { titleInputRef.current?.focus() }, [])` | Depois que o formulário aparece, usa a referência para dar foco |

- **`useRef(null)`** cria um objeto `{ current: null }` que o React guarda entre renderizações, como um estado. A diferença é que mudar o `.current` não provoca uma nova renderização.
- **`<HTMLInputElement>`** é o type do que o `.current` vai guardar: um elemento `<input>`. Ele começa `null` porque, durante a primeira renderização, o input ainda não existe na página.
- **O `focus()` fica num `useEffect`** porque o efeito é executado depois que o formulário aparece na tela. Nesse momento, o input já existe e `titleInputRef.current` aponta para ele. Com `[]`, isso acontece uma vez, quando o formulário aparece.
- **`?.`** chama `.focus()` só se `current` não for `null`. Se for `null`, a expressão para ali, sem erro.

### `autoFocus`

```tsx
<input autoFocus ... />
```

Para este caso, o atributo `autoFocus` faz o mesmo em uma linha: o React dá foco ao campo assim que ele aparece. A demo usa `useRef` porque ele é a ferramenta geral, necessária sempre que algo precisa ser feito num elemento em outro momento: focar um campo depois de um erro, rolar a página até um elemento ou medir o tamanho de algo. Para "focar quando aparecer", o `autoFocus` basta.

# Etapa 5b: criar o projeto

| Arquivo | O que mudou |
|---|---|
| `features/projects/types/project.ts` | Ganhou o type `NewProject` |
| `features/projects/services/projectsApi.ts` | Ganhou `createProject`, que faz o POST |
| `features/projects/hooks/useProjects.ts` | Ganhou `reload`, que busca a lista de novo |
| `features/projects/components/NewProjectForm.tsx` | Envia o projeto, mostra erro e avisa a página quando termina |
| `features/projects/pages/ProjectsPage.tsx` | Fecha o modal e busca a lista depois da criação |

## 8. `createProject`

```ts
export async function createProject(project: NewProject): Promise<Project> {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  })

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao criar projeto`)
  }

  return response.json()
}
```

A estrutura é a mesma do `listProjects`, com as opções de POST da lição 05. O `NewProject` é o type do que vai no corpo, sem `id`, porque quem cria o `id` é o backend. O backend responde 201 com o projeto criado, já com `id`.

Antes do POST, o navegador envia um pedido `OPTIONS` ao backend, perguntando se a origem `localhost:5173` pode enviar um POST com `Content-Type: application/json`. Esse pedido aparece na aba Network e faz parte do CORS. Só depois da resposta autorizando é que o POST é enviado.

## 9. O envio no formulário

O formulário ganha dois estados e uma prop:

| Novo | Para quê |
|---|---|
| `isSaving` (estado) | Saber se o POST está em andamento |
| `error` (estado) | Guardar a mensagem de erro do POST, ou `null` |
| `onCreated` (prop) | Avisar a página de que o projeto foi criado |

```tsx
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  setIsSaving(true)
  setError(null)

  try {
    await createProject({ title: title.trim(), description: description.trim() || null })
    onCreated()
  } catch {
    setError('Não foi possível criar o projeto.')
    setIsSaving(false)
  }
}

const canSubmit = title.trim() !== '' && !isSaving
```

- **`handleSubmit` virou `async`** porque agora usa `await`.
- **`setIsSaving(true)`** desabilita o "Criar" enquanto o POST não termina, pelo caminho abaixo. Isso impede que um clique duplo crie o projeto duas vezes.
  1. `setIsSaving(true)` troca o estado e faz o React redesenhar o formulário.
  2. Na nova renderização, `!isSaving` dá `false`, então `canSubmit` dá `false`.
  3. `disabled={!canSubmit}` vira `disabled={true}`.
- **`description.trim() || null`**: o `||` devolve o valor da esquerda se ele tiver conteúdo, e o da direita se for vazio. Uma descrição vazia vira `null`, que é o que o type `NewProject` e o backend esperam. O `||` faz o oposto do `&&` da lição 04.
- **`onCreated()`** avisa a página. Ela fecha o modal e busca a lista de novo.
- **No `catch`**, a mensagem aparece no formulário (`{error && <p>{error}</p>}`) e o botão volta a funcionar, para o usuário tentar de novo. Os campos continuam preenchidos.

## 10. Buscar a lista de novo: `reload`

```ts
const [reloadCount, setReloadCount] = useState(0)

useEffect(() => {
  ...
  load()
}, [reloadCount])

function reload() {
  setReloadCount((count) => count + 1)
}
```

### Array de dependências

Depois de cada renderização, o React compara cada valor do array com o valor que ele tinha na renderização anterior. Se algum mudou, ou se é a primeira renderização, o efeito é executado. Se nenhum mudou, o efeito é pulado.

| Renderização | Motivo | `reloadCount` | Mudou? | Efeito |
|---|---|---|---|---|
| 1ª | A página apareceu | 0 | É a primeira | Executado: GET |
| 2ª | Os projetos chegaram | 0 | Não | Pulado |
| 3ª | O modal abriu | 0 | Não | Pulado |
| 4ª | Um projeto foi criado e `reload()` foi chamado | 1 | Sim, de 0 para 1 | Executado: GET |

`reload` só soma 1 ao `reloadCount`, e isso basta para o efeito buscar a lista outra vez. O valor em si não importa, só o fato de mudar. Ele fica na memória da página, não no código: depois de 95 criações vale 95, e recarregar o navegador o zera.

`setReloadCount((count) => count + 1)` passa uma função em vez de um valor. O React chama essa função com o valor mais recente do estado e guarda o resultado. Essa forma é a correta quando o valor novo depende do anterior, porque continua certa mesmo que `reload` seja chamada duas vezes seguidas antes de uma nova renderização.

Durante a nova busca, `isLoading` não volta a `true`. A lista antiga continua na tela até a nova chegar, em vez de piscar "Carregando projetos...".

Um contador que só existe para provocar uma nova busca é um recurso artificial. Ele funciona, mas a etapa 7 mostra o React Query, em que a lista é marcada como desatualizada e buscada de novo sem esse contador.

### O que acontece ao clicar em "Criar"

1. `handleSubmit` envia o POST e espera a resposta 201.
2. O formulário chama `onCreated()`, que é o `handleCreated` da página.
3. `handleCreated` chama `setIsCreating(false)`, e o modal sai da tela.
4. `handleCreated` chama `reload()`, e `reloadCount` passa de 0 para 1.
5. Na renderização seguinte, o React vê que `reloadCount` mudou e executa o efeito do `useProjects`. Um novo GET é enviado.
6. A resposta chega com o projeto novo, `setProjects` troca a lista, e o card aparece.

## 11. O que o modal da demo não faz

O `role="dialog"`, o `aria-modal="true"` e o `aria-label` avisam ao leitor de tela que aquilo é uma janela de diálogo e qual é o título dela. Ainda faltam coisas que um modal completo deveria fazer:

- **Fechar com Esc.**
- **Prender o foco:** com Tab, o foco sai do modal e vai para os elementos da página por trás.
- **Devolver o foco:** ao fechar, o foco deveria voltar ao botão "Novo projeto".
- **Travar a rolagem:** a página por trás continua rolando.

Implementar isso à mão é trabalhoso e fácil de errar. É por isso que o dash usa o `Dialog` do Radix (via shadcn, em `components/ui`), que já faz tudo isso. A etapa 7 trata disso.

## Commits

O `.env.example` e a mudança no `.gitignore` vêm antes, num commit próprio:

```
git add frontend/.env.example frontend/.gitignore
```

```
chore: add env example and ignore the local env file so the API address is documented without committing it
```

Etapa 5a:

```
feat: add a reusable modal with a new project form that opens, validates the title and closes on cancel or outside click
```

Etapa 5b:

```
feat: create projects through a POST from the modal form with saving and error states and reload the list afterwards
```
