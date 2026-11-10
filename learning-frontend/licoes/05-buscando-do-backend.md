# Lição 05: buscando os projetos no backend

Até a etapa 3, os projetos estavam escritos no código da página. Agora eles vêm do backend, pelo GET `/projects`. A resposta leva algum tempo para chegar e pode falhar, então a página precisa mostrar quatro situações: carregando, erro, lista vazia e lista com projetos.

| Arquivo | Papel |
|---|---|
| `frontend/.env` | Guarda o endereço do backend |
| `services/projectsApi.ts` | Faz o pedido HTTP. Não usa React |
| `hooks/useProjects.ts` | Guarda os projetos, o carregamento e o erro, e dispara a busca |
| `pages/ProjectsPage.tsx` | Mostra a situação atual |

## 1. Hooks

**Renderizar** é o React chamar a função do componente para saber o que deve aparecer na tela. Isso acontece quando o componente aparece pela primeira vez e de novo a cada vez que algo nele precisa mudar.

Por ser uma função chamada várias vezes, um componente tem três limitações:
1. **Toda variável local é criada de novo a cada chamada.** Um valor calculado numa renderização não existe mais na seguinte.
2. **O componente não consegue pedir ao React para chamá-lo de novo.** Alterar uma variável não faz a tela mudar.
3. **O código do componente é executado antes de o resultado estar na tela.** Ele só monta a descrição do que mostrar, então não há momento certo para executar algo depois que a tela foi atualizada.

Quem controla quando o componente é chamado, e quem guarda dados fora dele, é o React. Hooks são as funções do React, com nome começando por `use`, pelas quais um componente pede ao React para fazer algo que ele sozinho não consegue:

| Hook | O que o React faz pelo componente | Onde aparece |
|---|---|---|
| `useState` | Guarda um valor para o componente entre uma renderização e outra, e devolve uma função que troca esse valor e faz o React renderizar o componente de novo | Esta etapa |
| `useEffect` | Executa uma função depois que o resultado do componente está na tela, e de novo apenas quando valores indicados mudarem. Quando o componente sai da tela, executa a função de limpeza | Esta etapa e a 5 |
| `useRef` | Guarda um valor entre renderizações sem renderizar de novo quando ele muda. É usado para apontar para um elemento real da página, como o campo de texto, e chamar `.focus()` nele | Etapa 5 |

O React tem outros hooks, que a demo não usa.

Um **hook customizado** é uma função escrita por você cujo nome começa com `use` e que chama outros hooks. O `useProjects` chama `useState` e `useEffect`, e por isso é um hook.

Hooks só podem ser chamados no início de um componente ou de outro hook, nunca dentro de um `if`, de um laço de repetição ou de uma função interna. O React identifica cada `useState` pela ordem em que eles são chamados, e essa ordem precisa ser sempre a mesma.

### JSX, `.ts` e `.tsx`

JSX é uma extensão da sintaxe do JavaScript que permite escrever tags parecidas com HTML dentro do código, como `<p>{error}</p>`. O navegador não entende JSX: antes de enviar o arquivo, o Vite converte cada tag numa chamada de função que devolve um objeto descrevendo o que mostrar (lição 03). É o que os componentes devolvem.

Um arquivo tem JSX quando contém alguma tag como valor no código: depois de `return`, de `=`, dentro de `( )` ou dentro de `{ }`, com fechamento `</...>` ou `/>`. Se tiver, a extensão precisa ser `.tsx`. Num `.ts`, o TypeScript não reconhece as tags e acusa erro de sintaxe.

| Arquivo | Tem tags? | Extensão |
|---|---|---|
| `main.tsx` | Sim: `<StrictMode>`, `<App />` | `.tsx` |
| `App.tsx`, `ProjectsPage.tsx`, `ProjectCard.tsx` | Sim | `.tsx` |
| `project.ts`, `projectsApi.ts`, `useProjects.ts` | Não. Só types, funções e dados | `.ts` |

**Cuidado com `< >` que não é JSX.** Em `useState<Project[]>([])` e `Promise<Project[]>`, os sinais `< >` aparecem colados depois de um nome e não têm tag de fechamento. Isso passa um type para aquele nome, e não é JSX.

A extensão não define se algo é hook ou componente. Um componente devolve JSX, então fica em `.tsx`. O `useProjects` devolve dados, então fica em `.ts`.

## 2. Promise, `async` e `await`

### Promise

Uma **Promise** é um objeto que representa uma operação que ainda não terminou. Ela está sempre num destes três estados:

| Estado | Significado |
|---|---|
| pendente | a operação ainda não terminou |
| cumprida | terminou com sucesso, e a Promise guarda o resultado |
| rejeitada | terminou com falha, e a Promise guarda o erro |

O nome vem disso: a Promise representa um valor que ainda não existe, mas que vai existir no futuro, ou então um erro. Uma vez cumprida ou rejeitada, ela não muda mais.

A Promise não é uma função. É o valor que certas funções devolvem quando o trabalho delas demora. O `fetch(url)` envia o pedido HTTP e devolve imediatamente uma Promise pendente. Depois:
- quando a resposta do servidor chega, a Promise é cumprida, e o resultado é um objeto `Response`;
- quando nenhuma resposta chega (servidor desligado, sem rede ou bloqueio de CORS), a Promise é rejeitada com um erro.

### `await` e `async`

`await` espera uma Promise terminar:

```ts
const response = await fetch('http://localhost:8000/projects')
```

- Se a Promise for cumprida, o `await` devolve o resultado, que aqui fica guardado em `response`.
- Se for rejeitada, o `await` lança o erro naquela linha, e ele pode ser capturado com `try`/`catch` (seção 6).

O `await` pausa só a função em que ele está. O resto da página continua funcionando, recebendo cliques e redesenhando, enquanto a resposta não chega.

`await` só pode ser usado dentro de uma função marcada com `async`. Uma função `async` sempre devolve uma Promise, mesmo que o `return` dela seja um valor comum.

### Vários `await` em sequência

```ts
const projetos = await fetch(`${API_URL}/projects`)
const usuarios = await fetch(`${API_URL}/users`)
```

Os pedidos **não** saem ao mesmo tempo. O segundo `fetch` só começa depois que a resposta do primeiro chega, e o tempo total é a soma dos dois.

Para enviar os dois juntos, use `Promise.all`:

```ts
const [projetos, usuarios] = await Promise.all([
  fetch(`${API_URL}/projects`),
  fetch(`${API_URL}/users`),
])
```

Os dois `fetch` começam na mesma hora, e o `await` espera ambos terminarem. O tempo total é o do mais lento. Se qualquer um for rejeitado, o `Promise.all` inteiro é rejeitado.

Quando alguns pedidos podem falhar e os outros devem ser aproveitados mesmo assim, use `Promise.allSettled`. Ele espera todos terminarem e informa, para cada um, se foi cumprido ou rejeitado.

### Pedidos que demoram demais

O `fetch` não tem tempo limite próprio e pode ficar pendente por minutos, até o navegador desistir. Para impor um limite:

```ts
fetch(url, { signal: AbortSignal.timeout(5000) })
```

Depois de 5000 milissegundos sem resposta, a Promise é rejeitada com um erro de tempo esgotado. A demo não usa isso.

## 3. O service: `projectsApi.ts`

```ts
import { Project } from '../types/project'

const API_URL = import.meta.env.VITE_API_URL

export async function listProjects(): Promise<Project[]> {
  const response = await fetch(`${API_URL}/projects`)

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao buscar projetos`)
  }

  return response.json()
}
```

- **`const API_URL = import.meta.env.VITE_API_URL`** lê o endereço do backend no arquivo `.env` (seção 4). O valor é `'http://localhost:8000'`.
- **`export async function listProjects(): Promise<Project[]>`** declara a função. `async` permite usar `await` dentro dela. `: Promise<Project[]>`, depois dos parênteses, é o type do valor que a função devolve: uma Promise que, quando cumprida, contém um `Project[]`. Os sinais `< >` logo depois de um nome passam um type para ele. Aqui, dizem qual é o type do resultado guardado na Promise.
- **`await fetch(`${API_URL}/projects`)`** envia o pedido e espera a resposta. Sem nenhuma opção, o `fetch` usa o método GET.
- **`if (!response.ok)`** verifica o status. `response.ok` é `true` quando o status está entre 200 e 299, e o `!` inverte o valor, então a linha diz "se o status não estiver entre 200 e 299". Essa verificação é necessária porque um 404 ou um 500 também são respostas, e a Promise do `fetch` é cumprida normalmente nesses casos. Ela só é rejeitada quando nenhuma resposta chega.
- **`throw new Error(...)`** encerra a função com um erro. Como a função é `async`, a Promise que ela devolve é rejeitada com esse erro.
- **`return response.json()`** lê o corpo da resposta, que é um texto em JSON, e o converte em objetos JavaScript. O texto `[{"id": "...", "title": "..."}]` vira um array de objetos no formato `Project`.

### POST e DELETE

O `fetch` aceita um segundo argumento, um objeto com as opções do pedido:

```ts
await fetch(`${API_URL}/projects`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Novo projeto', description: null }),
})

await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' })
```

- **`method`** escolhe o método HTTP.
- **`body`** é o corpo do pedido. `JSON.stringify` converte o objeto em texto JSON.
- **`headers`** traz os cabeçalhos do pedido. `'Content-Type': 'application/json'` avisa ao backend que o corpo é JSON. Sem ele, o FastAPI não lê o corpo e responde 422.

O POST entra na etapa 5, e o DELETE na etapa 6.

## 4. Variável de ambiente: `.env`

```
VITE_API_URL=http://localhost:8000
```

O endereço do backend muda conforme o ambiente: na sua máquina é `localhost:8000`, e em produção é outro. Por isso ele fica num arquivo `.env` em vez de no código, e cada ambiente tem o seu.

O Vite lê esse arquivo e disponibiliza em `import.meta.env` apenas as variáveis cujo nome começa com `VITE_`. Uma variável sem esse prefixo, como uma senha de banco de dados, nunca é incluída no código da página.

- **Mudou o `.env`? Reinicie o `npm run dev`.** O Vite só lê o arquivo quando é iniciado.
- **Nada no frontend é secreto.** O valor de uma variável `VITE_` vai para o navegador junto com o código, e qualquer pessoa pode lê-lo pelo F12. No dash, é por isso que o frontend usa a anon key do Supabase, e nunca a service role key.

## 5. `useState`: dar memória a um componente

### Uma variável comum não basta

Este botão deveria contar cliques:

```tsx
export function Counter() {
  let count = 0

  function handleClick() {
    count = count + 1
  }

  return <button onClick={handleClick}>Cliques: {count}</button>
}
```

`onClick` recebe a função que o React chama quando o botão é clicado.

Clicar não muda nada na tela, por dois motivos:

1. **Variáveis locais não sobrevivem entre renderizações.** Para atualizar a tela, o React chama `Counter` de novo, e a linha `let count = 0` é executada outra vez. O valor anterior se perde.
2. **Alterar uma variável local não dispara uma renderização.** O React não sabe que `count` mudou, então não chama `Counter` de novo.

Para atualizar a tela com um dado novo, um componente precisa de duas coisas:
1. guardar o dado entre uma renderização e outra;
2. avisar o React para renderizar de novo com o dado novo.

O `useState` oferece as duas: uma **variável de estado**, que guarda o dado, e uma **função de atualização**, que troca o dado e avisa o React.

### Com `useState`

```tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
  }

  return <button onClick={handleClick}>Cliques: {count}</button>
}
```

`useState(0)` recebe o valor inicial e devolve um array com dois itens: o valor atual e a função que troca esse valor. `const [count, setCount] =` separa esse array em duas variáveis, pela posição (desestruturação de array). Os nomes são escolhidos por você, e a convenção é `algo` e `setAlgo`.

O que acontece, passo a passo:

1. **Primeira renderização.** `useState(0)` devolve `[0, setCount]`. O botão mostra "Cliques: 0".
2. **Clique.** `handleClick` chama `setCount(1)`. O React guarda o 1 e agenda uma nova renderização.
3. **Segunda renderização.** O React chama `Counter` de novo. O `useState(0)` agora ignora o 0, que só vale na primeira vez, e devolve `[1, setCount]`. O botão mostra "Cliques: 1".

### Os três estados do `useProjects`

A lista de projetos muda com o tempo: quando a página aparece ela ainda não chegou, e um pouco depois a resposta chega. É exatamente o caso em que o `useState` é necessário. O hook guarda três informações independentes, uma por `useState`:

```ts
const [projects, setProjects] = useState<Project[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

| Variável | Guarda | Valor inicial |
|---|---|---|
| `projects` | os projetos recebidos | `[]`, nenhum projeto |
| `isLoading` | se a busca ainda está acontecendo | `true`, porque a busca começa assim que a página aparece |
| `error` | a mensagem de erro | `null`, nenhum erro |

Os valores ao longo do tempo:

| Momento | `projects` | `isLoading` | `error` | Tela |
|---|---|---|---|---|
| A página aparece | `[]` | `true` | `null` | "Carregando projetos..." |
| A resposta chega com sucesso | os 3 projetos | `false` | `null` | a lista |
| A busca falha | `[]` | `false` | `'Não foi possível...'` | a mensagem de erro |

As funções `setProjects`, `setIsLoading` e `setError` são o único jeito de passar de uma linha da tabela para a outra. Cada chamada troca um valor e faz o React renderizar a página de novo com ele.

### O `<Project[]>` em `useState<Project[]>([])`

O valor inicial é `[]`. O `<Project[]>` diz ao TypeScript que tipo de valor esse estado guarda.

Ele é necessário porque o TypeScript deduz o type a partir do valor inicial, e um array vazio não diz o que vai haver dentro dele. Sem o `<Project[]>`, o TypeScript conclui que o array nunca pode ter nada, e `setProjects(listaDeProjetos)` fica sublinhado em vermelho. O mesmo acontece com `useState<string | null>(null)`: a partir de `null` sozinho, o TypeScript entenderia que o estado só pode ser `null`, e `setError('mensagem')` daria erro.

Em `useState(true)`, o valor inicial já mostra que o type é `boolean`, e não é preciso escrever nada.

## 6. `useEffect`: executar código depois que o componente aparece

### Chamar a busca direto no hook não funciona

Uma primeira tentativa seria chamar a busca no próprio corpo do hook:

```ts
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])

  async function load() {
    setProjects(await listProjects())
  }

  load()

  return { projects }
}
```

O que acontece:

1. O React renderiza a página. `useProjects` é executado, e `load()` envia um GET.
2. A resposta chega. `setProjects` troca o valor e faz o React renderizar de novo.
3. Na nova renderização, `useProjects` é executado outra vez, e `load()` envia outro GET.
4. A resposta chega, `setProjects` provoca outra renderização, e o ciclo não termina.

Na aba Network, os pedidos para `projects` apareceriam sem parar.

### Com `useEffect`

O `useEffect` permite executar código **depois** que o componente aparece na tela, e controlar quando esse código deve ser executado de novo:

```ts
useEffect(() => {
  // código a executar
}, [])
```

Ele recebe dois argumentos:

1. **Uma função**, que é o efeito. O React a executa depois que o componente aparece na tela.
2. **Um array de dependências.** Depois de cada renderização, o React compara os valores desse array com os da renderização anterior, e só executa o efeito de novo se algum deles mudou. Com `[]`, não há nada para mudar, e o efeito é executado uma única vez, quando o componente aparece pela primeira vez.

O nome "efeito" se refere a ações que alcançam algo fora do React, como enviar um pedido ao backend ou escutar o teclado (etapa 5).

### O efeito do `useProjects`

```ts
useEffect(() => {
  async function load() {
    try {
      setProjects(await listProjects())
    } catch {
      setError('Não foi possível carregar os projetos.')
    } finally {
      setIsLoading(false)
    }
  }

  load()
}, [])
```

**Por que existe a função `load`.** Ela usa `await`, então precisa ser `async`. Mas o efeito em si não pode ser `async`: uma função `async` sempre devolve uma Promise, e o React espera que a função do efeito devolva nada ou uma função de limpeza (etapa 5). Por isso, a função `async` é declarada dentro do efeito e chamada logo em seguida com `load()`.

**`try`, `catch` e `finally`:**
- **`try { ... }`** executa o bloco. Se `listProjects` for bem-sucedida, os projetos são guardados.
- **`catch { ... }`** só é executado se algo dentro do `try` lançar um erro, seja o `throw` do service ou o `fetch` rejeitado com o servidor desligado. A mensagem de erro é guardada.
- **`finally { ... }`** é executado sempre, depois do `try` ou do `catch`. Com sucesso ou falha, a busca terminou, então `isLoading` passa a `false`.

### O que acontece, passo a passo

1. **Primeira renderização.** O React chama `ProjectsPage`, que chama `useProjects`. Os `useState` devolvem os valores iniciais (`[]`, `true` e `null`), e a página mostra "Carregando projetos...".
2. **Depois que isso aparece na tela,** o React executa o efeito. `load()` envia o GET.
3. **A resposta chega.** `setProjects` e `setIsLoading` trocam os valores, e o React renderiza de novo.
4. **Segunda renderização.** Os `useState` devolvem os valores novos (os projetos e `false`), e a página mostra a lista. O efeito não é executado de novo, porque o array de dependências `[]` não mudou.

## 7. Os dois GETs: StrictMode

Na aba Network, aparecem **dois** pedidos para `projects`. A causa é o `StrictMode` do `main.tsx`. Em desenvolvimento, quando um componente aparece pela primeira vez, o React:

1. monta o componente, e o efeito é executado, enviando o 1º GET;
2. desmonta o componente, como se ele tivesse saído da tela;
3. monta de novo, e o efeito é executado outra vez, enviando o 2º GET.

Isso serve para revelar efeitos que não se desfazem ao sair da tela. Um efeito que começa a escutar o teclado e não para ao sair passaria a escutar em dobro, e o problema apareceria imediatamente. A forma de desfazer um efeito é a função de limpeza, assunto da etapa 5.

Aqui o GET duplicado não causa problema: os dois pedidos trazem os mesmos dados, e o segundo só grava a mesma lista. No `npm run build`, o `StrictMode` não faz isso, e o GET acontece uma vez.

## 8. Como a página usa o hook

O `useProjects` termina com:

```ts
return { projects, isLoading, error }
```

Essa linha cria um objeto com três campos e o devolve. A forma `{ projects }` é uma abreviação de `{ projects: projects }`: o campo tem o mesmo nome da variável e recebe o valor dela. Objetos existem normalmente em TypeScript, já que TypeScript é JavaScript com types. O que não é um objeto é o type, que só descreve objetos.

Na página:

```ts
const { projects, isLoading, error } = useProjects()
```

- **`useProjects()`** chama o hook. Ele não recebe argumentos porque não precisa de nenhuma informação de fora para buscar os projetos.
- **`const { projects, isLoading, error } =`** desestrutura o objeto devolvido em três variáveis.

As funções `setProjects`, `setIsLoading` e `setError` não são devolvidas porque a página não precisa trocar esses valores. Só o próprio hook os troca.

## 9. As quatro situações na página

```tsx
function renderContent() {
  if (isLoading) {
    return <p>Carregando projetos...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (projects.length === 0) {
    return <p>Nenhum projeto cadastrado.</p>
  }

  return <ul>...</ul>
}
```

`renderContent` é uma função declarada dentro do componente que decide o que aparece abaixo do cabeçalho. Cada `return` encerra a função naquele ponto, então a ordem dos `if` importa: carregando, depois erro, depois vazio e, por último, a lista. `projects.length` é a quantidade de itens no array, e `===` verifica se dois valores são iguais.

No JSX, `{renderContent()}` chama a função e coloca o resultado na tela.

## 10. Ver cada situação

O backend precisa estar ligado, e o `npm run dev` precisa ser reiniciado por causa do `.env` novo.

**Lista.** Abra a página normalmente.

**Carregando.** O carregamento dura poucos milissegundos, então é preciso pausar a busca. Use um ponto de interrupção de pedidos:
- **Firefox:** aba Depurador, painel lateral "Pontos de interrupção XHR", botão "+", digite `projects` e recarregue a página.
- **Chrome:** aba Sources, painel "XHR/fetch Breakpoints", botão "+", digite `projects` e recarregue a página.

A execução para no `fetch`, e a página fica mostrando "Carregando projetos...". Para continuar, clique em "Continuar" (F8). Remova o ponto de interrupção depois.

A limitação de velocidade da aba Network não funciona bem para isso: ela atrasa também o carregamento de todos os arquivos JavaScript da página, e no Firefox o atraso máximo de cada pedido fica em torno de meio segundo.

**Erro.** Desligue o uvicorn com `Ctrl+C` e recarregue. Na aba Network, o pedido aparece como falho.

**Vazio.** Pelo `localhost:8000/docs`, apague os três projetos e recarregue. Para recuperá-los, reinicie o uvicorn.

Na aba Network, clique no pedido `projects` para ver o método, o endereço e o status em Cabeçalhos (Headers), e o JSON devolvido em Resposta (Response).

### CORS

A página vem de `localhost:5173`, e os dados vêm de `localhost:8000`. Para o navegador, portas diferentes são origens diferentes. Por segurança, ele só entrega a resposta à página se o backend autorizar aquela origem. Quem autoriza é o `CORSMiddleware` do `main.py`, que libera `http://localhost:5173`. Se a página for aberta por `127.0.0.1:5173`, a origem muda, o backend não autoriza, e o console mostra um erro de CORS.

## Commit

```
feat: load projects from the backend through a service and a useProjects hook with loading, error and empty states
```
