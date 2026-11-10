# Lição 03: lendo os arquivos da demo linha por linha

## Quanto disso é TypeScript

TypeScript é JavaScript com anotações de tipo. Todo código JavaScript válido também é TypeScript válido, e o que o TypeScript acrescenta são marcações como `nome: string`, que dizem que tipo de valor uma variável aceita. O compilador do TypeScript confere essas marcações e depois as apaga, porque o navegador só roda JavaScript, e é por isso que, na aba Network, o `main.tsx` chega sem nenhum tipo.

Nos três arquivos que a demo tem até agora (`main.tsx`, `App.tsx` e `ProjectsPage.tsx`), a única coisa exclusiva do TypeScript é o `!` do `main.tsx`. Todo o resto é JavaScript, e a parte que parece HTML é JSX. Então o que falta aprender agora é JavaScript. Os tipos entram na próxima lição, quando o card passar a receber dados.

As comparações abaixo usam Python, porque é a linguagem do backend.

## Funções

```js
function soma(a, b) {
  return a + b
}

const resultado = soma(2, 3)
```

Em Python, seria:

```python
def soma(a, b):
    return a + b

resultado = soma(2, 3)
```

Peça por peça:

- **`function`** é a palavra que declara uma função, como o `def`.
- **`soma`** é o nome dela.
- **`(a, b)`** são os parâmetros, ou seja, os valores que quem chamar a função vai entregar.
- **`{ }`** delimita o corpo. Em JavaScript são as chaves que marcam onde a função começa e termina, e não a indentação, como em Python.
- **`return`** devolve um valor para quem chamou e encerra a função.

Declarar e executar são coisas diferentes. A declaração só guarda a receita com um nome, e nada roda nesse momento. A execução acontece quando alguém escreve o nome seguido de parênteses, como `soma(2, 3)`, e é aí que o corpo roda e o `return` entrega `5`.

O `const` cria uma variável que não pode receber outro valor depois, e o `let` cria uma que pode. Python não faz essa distinção.

## Um componente é uma função que devolve JSX

```tsx
export function ProjectsPage() {
  return (
    <main className="projects-page">
      <h1 className="projects-title">Projetos</h1>
    </main>
  )
}
```

**`function ProjectsPage()`** declara uma função chamada `ProjectsPage`, sem parâmetros. É exatamente o mesmo tipo de função do `soma`. A diferença está no que ela devolve.

**`return ( ... )`** devolve o JSX. Os parênteses só agrupam as várias linhas, e eles são necessários por uma regra do JavaScript: se a linha do `return` terminar logo depois da palavra, o JavaScript considera a instrução encerrada ali e a função devolve `undefined` (o "nada" do JavaScript, equivalente ao `None`). Com o parêntese aberto na mesma linha do `return`, o JavaScript sabe que a expressão continua.

**O JSX não é texto HTML.** O SWC transforma cada tag numa chamada de função antes de o código chegar ao navegador:

```tsx
<h1 className="projects-title">Projetos</h1>
```

vira

```js
jsx('h1', { className: 'projects-title', children: 'Projetos' })
```

Essa chamada devolve um objeto comum de JavaScript que descreve o que deve aparecer na tela. De forma simplificada, o objeto é este:

```js
{ type: 'h1', props: { className: 'projects-title', children: 'Projetos' } }
```

Em Python, um objeto desses seria um dicionário. Então `ProjectsPage` é uma função que devolve uma descrição da tela, e não a tela em si. Quem lê essa descrição e cria os elementos de verdade é o React.

**O JSX precisa ter um único elemento externo.** Uma função devolve um valor só, e cada tag vira um objeto, então duas tags lado a lado no `return` seriam dois valores. Para devolver dois elementos irmãos, envolva-os em `<>` e `</>`, o Fragment, que agrupa sem criar nenhum elemento na página.

## `export` e `import`

Cada arquivo é um módulo isolado: o que é declarado dentro dele fica invisível para os outros arquivos. Python faz o contrário, já que todo nome de um módulo pode ser importado. Em JavaScript, só é visível o que for marcado com `export`.

```tsx
export function ProjectsPage() { ... }
```

O `export` torna a função disponível para outros arquivos. Sem ele, o `App.tsx` não conseguiria usá-la.

```tsx
import { ProjectsPage } from '../features/projects/pages/ProjectsPage'
```

Esse import traz a função para dentro do `App.tsx`. Em Python, seria `from features.projects.pages.ProjectsPage import ProjectsPage`. O caminho é relativo ao arquivo que importa: `App.tsx` está em `src/app/`, o `..` sobe para `src/` e, de lá, o caminho desce até o arquivo. A extensão `.tsx` pode ser omitida, porque o Vite a encontra sozinho.

Há três formas de import nos arquivos da demo:

| Forma | Exemplo | O que significa |
|---|---|---|
| Caminho começando com `.` ou `..` | `from './App'` | Um arquivo do próprio projeto |
| Caminho sem ponto | `from 'react'` | Um pacote instalado na `node_modules` |
| Sem nome nenhum | `import '../index.css'` | "Carregue este arquivo", sem trazer nada para usar no código. No caso de CSS, o Vite coloca as regras na página |

As chaves em `{ ProjectsPage }` indicam um export nomeado, e o nome precisa ser exatamente o que foi exportado. Existe também o `export default`, importado sem chaves (`import App from './App'`), em que quem importa escolhe o nome. A demo usa só exports nomeados, como a maior parte do dash.

## Por que colocar `<ProjectsPage />` no `App` faz a página aparecer

```tsx
import { ProjectsPage } from '../features/projects/pages/ProjectsPage'

export function App() {
  return <ProjectsPage />
}
```

Assim como `<h1>` vira `jsx('h1', ...)`, a tag `<ProjectsPage />` vira `jsx(ProjectsPage, {})`. A diferença é que o primeiro argumento não é um texto, e sim a própria função que foi importada. O objeto resultante diz ao React "chame esta função aqui".

A sequência inteira é esta:

1. O `main.tsx` entrega `<App />` ao React.
2. O React chama `App()`, que devolve um objeto dizendo "chame `ProjectsPage` aqui".
3. O React chama `ProjectsPage()`, que devolve objetos `main`, `h1`, `ul` e assim por diante. São todos textos de tag HTML, então não há mais funções para chamar.
4. O React cria esses elementos na página.

Repare que você nunca escreve `ProjectsPage()` com parênteses. Escrever `<ProjectsPage />` é fazer um pedido, e quem executa é o React. Ele quer controlar a execução porque vai precisar chamar a função de novo sempre que os dados mudarem, para redesenhar a tela. Isso aparece na etapa 4, com o `useState`.

## E se eu colocar mais páginas no `App`?

```tsx
export function App() {
  return (
    <>
      <ProjectsPage />
      <SettingsPage />
    </>
  )
}
```

As duas aparecem na mesma tela, uma embaixo da outra. O React não sabe o que é uma "página". Para ele, `ProjectsPage` é um componente como qualquer outro, e a pasta `pages/` é só uma convenção para humanos.

Para mostrar uma página por endereço, é preciso um roteador, que é um componente que lê o endereço do navegador e decide qual componente desenhar. O dash usa a biblioteca `react-router-dom`, e o `dash/frontend/src/App.tsx` faz isto (versão simplificada):

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<ClientDashboard />} />
  </Routes>
</BrowserRouter>
```

O `Routes` lê o caminho do endereço atual, por exemplo `/login`, compara com o `path` de cada `Route` e desenha só o `element` daquele que bate. O código de todas as páginas é baixado, porque todas estão importadas, mas só a página escolhida é chamada. Quando se clica num `<Link to="/dashboard">`, o endereço muda sem recarregar a página, o `Routes` vê o novo caminho e troca o componente desenhado.

A demo tem uma página só e por isso não tem roteador. No workshop, o `App.tsx` do dash é o exemplo de várias páginas.

## `main.tsx` linha por linha

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import '../index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**`react` e `react-dom` são pacotes diferentes.** O `react` é o núcleo, que entende componentes, estado e a descrição da tela. O `react-dom` é a parte que sabe colocar essa descrição numa página web. A separação existe porque o mesmo núcleo também desenha em outros lugares, como no React Native, que gera telas de celular.

**`document`** é um objeto que o navegador fornece e que representa a página carregada. `document.getElementById('root')` procura o elemento com `id="root"` e devolve esse elemento, ou `null` se ele não existir.

**`!`** é a única coisa de TypeScript no arquivo. O TypeScript sabe que o resultado pode ser `null`, e o `!` diz a ele: "garanto que não é". Nada é verificado de fato, então, se a garantia for falsa, o erro aparece quando a página roda.

**`createRoot(elemento).render(...)`** são duas chamadas encadeadas. `createRoot` recebe a div e devolve um objeto que controla essa área da página, e `.render(...)` chama um método desse objeto. Em Python, a forma seria a mesma: `create_root(el).render(x)`.

**`<StrictMode><App /></StrictMode>`** coloca o `App` dentro do `StrictMode`. O `StrictMode` desenha o que estiver dentro dele e, em desenvolvimento, chama cada componente duas vezes para revelar componentes que alteram algo fora de si. Esse "o que estiver dentro" se chama `children`, e você vai usar o mesmo mecanismo no `Modal` da etapa 5.

**A vírgula depois de `</StrictMode>`** é permitida em JavaScript no último argumento e serve só à formatação.
