# Lição 04: componentes, props e listas

Hoje a `ProjectsPage` tem três `li` quase iguais, escritos à mão, e de um para outro só mudam o título e a descrição. Nesta etapa, o card é escrito uma vez só, e o título e a descrição são entregues a ele de fora.

Para isso, são necessárias quatro ideias, nesta ordem: objeto, props, desestruturação e type. Cada uma depende da anterior.

## 1. Objeto

Um objeto junta vários valores, cada um com um nome. Pense numa ficha de cadastro: cada campo tem um nome e um valor preenchido.

```js
const projeto = {
  id: '1',
  title: 'Observatório do Mercado de Trabalho',
  description: 'Indicadores de emprego e renda por região.',
}
```

- **`const projeto =`** guarda o objeto numa variável chamada `projeto`.
- **As chaves `{ }`** marcam onde o objeto começa e termina.
- **Cada linha de dentro é um campo:** o nome fica à esquerda dos dois-pontos, o valor fica à direita, e uma vírgula separa um campo do outro.

Para ler um campo, escreva o nome da variável, um ponto e o nome do campo:

```js
projeto.title // 'Observatório do Mercado de Trabalho'
projeto.id    // '1'
```

Quando um campo não tem valor, ele recebe `null`, que quer dizer "vazio de propósito":

```js
const outro = { id: '2', title: 'Avaliação do Ensino Médio', description: null }
```

Vários objetos juntos, entre colchetes, formam uma lista, que em JavaScript se chama array: `[projeto, outro]`.

## 2. Props: entregar dados a um componente

Na lição 03, `soma(2, 3)` entregava os valores 2 e 3 à função `soma`. Um componente também é uma função e também recebe valores. O que muda é a forma de escrever: em vez de parênteses, os valores entram como atributos da tag, do mesmo jeito que o `className`.

```tsx
<ProjectCard title="Saúde Pública em Números" description="Dados do SUS consolidados por município." />
```

Ao encontrar essa tag, o React faz duas coisas:

1. Junta todos os atributos num objeto só:
   ```js
   { title: 'Saúde Pública em Números', description: 'Dados do SUS consolidados por município.' }
   ```
2. Chama a função `ProjectCard` entregando esse objeto.

Esse objeto se chama **props**. Dentro do componente, ele chega como parâmetro, e os campos são lidos com ponto:

```tsx
export function ProjectCard(props) {
  return (
    <li>
      <h2>{props.title}</h2>
      <p>{props.description}</p>
    </li>
  )
}
```

`{props.title}`, entre chaves no meio das tags, quer dizer "coloque aqui o valor de `props.title`". Sem as chaves, a tela mostraria o texto "props.title".

Com isso, o mesmo componente desenha cards diferentes:

```tsx
<ProjectCard title="Observatório do Mercado de Trabalho" description="Indicadores de emprego e renda por região." />
<ProjectCard title="Saúde Pública em Números" description="Dados do SUS consolidados por município." />
```

No primeiro uso, `props.title` vale "Observatório do Mercado de Trabalho". No segundo, vale "Saúde Pública em Números". O card é escrito uma vez, e os dados mudam a cada uso.

**Aspas ou chaves no atributo?** Texto fixo vai entre aspas, como `title="Saúde"`. Qualquer outra coisa vai entre chaves:
- uma variável: `title={projeto.title}`;
- `null`: `description={null}`;
- um número: `total={3}`.

## 3. Desestruturação: um atalho para não repetir `props.`

Escrever `props.` antes de cada campo cansa. As duas versões abaixo fazem exatamente a mesma coisa:

**Sem desestruturação**

```tsx
export function ProjectCard(props) {
  const title = props.title
  const description = props.description

  return (
    <li>
      <h2>{title}</h2>
      <p>{description}</p>
    </li>
  )
}
```

**Com desestruturação**

```tsx
export function ProjectCard({ title, description }) {
  return (
    <li>
      <h2>{title}</h2>
      <p>{description}</p>
    </li>
  )
}
```

Na segunda versão, as chaves no lugar do parâmetro querem dizer: "do objeto que chegar, pegue o campo `title` e guarde numa variável `title`, e pegue o campo `description` e guarde numa variável `description`". Os nomes dentro das chaves precisam ser iguais aos nomes dos atributos usados na tag.

**As chaves `{ }` têm três significados diferentes, conforme o lugar:**

| Onde aparecem | O que significam | Exemplo |
|---|---|---|
| Depois de `=` | criam um objeto | `const projeto = { id: '1' }` |
| No meio das tags | inserem um valor | `<h2>{title}</h2>` |
| No lugar do parâmetro | desestruturam | `function ProjectCard({ title })` |

## 4. Type: descrever o formato para o editor avisar dos erros

O JavaScript não confere nada. Se alguém escrever `<ProjectCard titel="Saúde" />`, com erro de digitação, nenhum aviso aparece: o card sai sem título, e o erro só é descoberto olhando a tela.

O TypeScript resolve isso. Você descreve quais atributos o componente aceita e que tipo de valor cada um recebe, e o VS Code passa a sublinhar em vermelho qualquer uso errado, antes mesmo de você abrir o navegador. Essa descrição se chama **type**:

```tsx
type ProjectCardProps = {
  title: string
  description: string | null
}
```

Linha por linha:
- **`type ProjectCardProps =`** cria uma descrição com o nome `ProjectCardProps`.
- **`title: string`** diz que o campo `title` precisa ser texto. `string` é o nome do tipo texto.
- **`description: string | null`** diz que `description` precisa ser texto ou `null`. A barra `|` significa "ou".

Para dizer que as props do componente seguem essa descrição, coloque dois-pontos e o nome do type depois do parâmetro:

```tsx
export function ProjectCard({ title, description }: ProjectCardProps) {
```

### `ProjectCardProps`: a lista de exigências do card

**O problema.** O card é escrito num arquivo e usado em outro. A `ProjectsPage` escreve:

```tsx
<ProjectCard key={project.id} title={project.title} description={project.description} />
```

Quem usa o card precisa saber quais atributos ele espera, quais são obrigatórios e que tipo de valor cada um aceita. Sem TypeScript, nada responde a isso: é preciso abrir o `ProjectCard.tsx` e ler o código para descobrir.

**Parte 1: escrever a lista.**

```tsx
type ProjectCardProps = {
  title: string
  description: string | null
}
```

Traduzindo: "crie uma lista de exigências chamada `ProjectCardProps`. Ela pede um `title`, que é texto, e um `description`, que é texto ou `null`". O nome é uma convenção, nome do componente mais `Props`, e poderia ser qualquer outro. Sozinha, essa lista não está presa a nada.

**Parte 2: prender a lista ao componente com `:`.** Em TypeScript, dois-pontos depois de um nome se lê "que é do tipo". É a única forma de ligar um type a alguma coisa.

```tsx
export function ProjectCard({ title, description }: ProjectCardProps) {
```

Traduzindo: "`ProjectCard` recebe um objeto, que eu abro em `title` e `description`, e esse objeto é do tipo `ProjectCardProps`". O `: ProjectCardProps` fica depois das chaves porque fala do objeto inteiro que chega, e não de cada campo.

**Parte 3: o que muda depois da ligação.** O VS Code passa a conferir os dois lados.

*Quem usa o card (a página).* Cada `<ProjectCard ... />` é comparado com a lista, e o editor sublinha em vermelho:
- `<ProjectCard titel="Saúde" />`, porque `titel` não está na lista e `title` está faltando;
- `<ProjectCard title={42} description={null} />`, porque 42 não é texto.

Além disso, ao digitar `<ProjectCard ` e apertar `Ctrl+Espaço`, o editor sugere `title` e `description`, porque agora ele conhece a lista.

*O próprio card.* O editor sabe que `title` é sempre texto e que `description` pode ser `null`. Um `description.length` (o tamanho do texto) fica sublinhado, com o aviso de que `description` pode ser `null`. É por isso que a descrição passa pelo `&&` antes de ser usada.

**Parte 4: o que sobra para o navegador.** Removendo do arquivo tudo o que é TypeScript, ou seja, o bloco `type ProjectCardProps = { ... }` e o trecho `: ProjectCardProps`, sobra isto:

```tsx
export function ProjectCard({ title, description }) {
  return (...)
}
```

É exatamente isso que o Vite envia ao navegador, e a tela fica igual. A lista de exigências e o `:` servem só para o editor conferir o código enquanto você escreve.

**Por que `ProjectCardProps` e não `Project`?** São listas diferentes. `Project` descreve um projeto como ele chega do backend, com `id`. `ProjectCardProps` descreve o que o card pede, e o card não usa o `id`. Outra opção seria o card receber o projeto inteiro (`{ project }: { project: Project }`). Não existe resposta errada, mas pedir só o que o componente usa deixa a lista de exigências mais curta.

**O type não aparece na tela e não muda o que a página faz.** Ele serve só para o editor conferir o que você escreveu. O navegador não entende TypeScript, então o Vite remove todas as linhas de type antes de enviar o código.

**A página abre mesmo com erro de type.** O `npm run dev` só remove os types, sem conferir. O aviso aparece em dois lugares: no VS Code, com o sublinhado vermelho, e no `npm run build`, que se recusa a gerar os arquivos enquanto houver erro.

### O type `Project`

Os dados de um projeto aparecem em vários arquivos: na página, no card e, mais adiante, nas chamadas ao backend. Em vez de repetir `id`, `title` e `description` em cada um, a descrição é escrita uma vez, num arquivo próprio, e exportada:

```ts
export type Project = {
  id: string
  title: string
  description: string | null
}
```

Quem precisar dela importa normalmente: `import { Project } from '../types/project'`.

`Project[]`, com colchetes depois do nome, quer dizer "um array de objetos no formato `Project`".

## 5. Mostrar a descrição só quando ela existir

```tsx
{description && <p>{description}</p>}
```

Leia assim: "se `description` tiver valor, mostre o `<p>`". Quando `description` é `null`, nada aparece.

O motivo: o `&&` olha primeiro o valor da esquerda.
- Se esse valor for vazio (`null`, texto vazio ou `false`), o resultado é esse próprio valor vazio, e o React não desenha nada.
- Se tiver conteúdo, o resultado é o que está à direita, ou seja, o `<p>`.

Há uma exceção: o número `0` conta como vazio para o `&&`, mas o React o desenha como "0" na tela. No nosso caso, a descrição é texto ou `null`, então isso não acontece.

## 6. Listas com `.map`

```tsx
projects.map((project) => (
  <ProjectCard key={project.id} title={project.title} description={project.description} />
))
```

O `.map` percorre o array: para cada item, executa a função que está entre os parênteses e guarda o resultado num array novo. Aqui, para cada projeto, ele cria um `<ProjectCard>`. Com três projetos, saem três cards, e com dez projetos, saem dez.

`(project) => ( ... )` é uma função escrita de forma curta, chamada arrow function. Ela equivale a:

```js
function (project) {
  return ( ... )
}
```

`project` é o nome que você escolhe para "o item da vez". Colocado entre chaves dentro do `<ul>`, o resultado do `.map` faz o React desenhar todos os cards.

## 7. `key`

Quando a lista muda, por exemplo quando um projeto é apagado na etapa 6, o React compara a lista nova com a anterior para saber o que atualizar na tela. A `key` é a etiqueta que identifica cada item nessa comparação.

Sem a `key`, o React compara pela posição: apagar o primeiro projeto faz todos os outros parecerem alterados, porque cada um passou a ocupar o lugar do anterior. Com a `key`, ele sabe que o item de `id` "1" sumiu e que os outros continuam iguais.

Regras da `key`:
- precisa ser única na lista e não pode mudar, por isso use o `id`;
- não chega ao componente como prop, porque o React a guarda para si;
- se ela faltar, o console do navegador mostra o aviso `Each child in a list should have a unique "key" prop`.

## 8. Template string

```tsx
aria-label={`Apagar ${title}`}
```

Um texto entre crases aceita `${...}`, que é trocado pelo valor da variável. Se `title` vale "Saúde Pública em Números", o resultado é "Apagar Saúde Pública em Números".

O `aria-label` dá um nome ao botão para quem usa leitor de tela, já que esse botão só tem um ícone e nenhum texto.

## 9. lucide-react

Instale, dentro da pasta `frontend`:

```powershell
npm install lucide-react
```

É a biblioteca de ícones do dash. Cada ícone é um componente: `import { Trash2 } from 'lucide-react'` e depois `<Trash2 className="h-5 w-5" />`. Só os ícones importados vão para o código final. Ela entra em `dependencies` (sem o `-D`) porque o código dela vai para a página.

## O que foi escrito

**`src/features/projects/types/project.ts`**
- O type `Project`, exportado, igual ao da seção 4.

**`src/features/projects/components/ProjectCard.tsx`**
- Recebe `title` e `description`, com as props tipadas como na seção 4.
- Devolve o `li` com as classes que hoje estão na página, mais:
  - `flex items-start justify-between gap-4`, para deixar o texto à esquerda e a lixeira à direita;
  - `transition-colors hover:bg-[#FFF8F5]`, para o hover do card.
- Dentro do `li`:
  - uma `div` com o título e a descrição. É a primeira `div` da demo, e ela existe só para agrupar esses dois, para que o flexbox trate os dois como um bloco só ao lado da lixeira;
  - a descrição só aparece quando existir, como na seção 5;
  - um `button` com `type="button"`, o `aria-label` da seção 8, o ícone `Trash2` e as classes `text-neutral-500 transition hover:text-red-600 active:scale-95`. Por enquanto, ele não faz nada.

**`src/features/projects/pages/ProjectsPage.tsx`**
- Uma constante `projects` com os três projetos de hoje (ids `'1'`, `'2'` e `'3'`), declarada acima da função `ProjectsPage`. Na etapa 4, ela é trocada pelos dados do backend.
- Os três `li` dão lugar a um `.map` dentro do `ul`, que cria um `ProjectCard` por projeto, com `key`.
- O botão "Novo projeto" ganha `transition active:scale-95`, para a animação de clique.

### Por que não existe um `ProjectList`

O `ul` com o `.map` poderia virar um componente próprio, `ProjectList`. Isso deixaria a página mais curta, mas acrescentaria um arquivo e mais uma camada de props, de `ProjectsPage` para `ProjectList` e de `ProjectList` para `ProjectCard`, sem nenhum ganho numa página tão pequena. Fica como evolução possível, quando a lista crescer ou precisar ser reutilizada em outra tela.

## Commit

```
refactor: extract ProjectCard component with a Project type so cards render from a data array instead of repeated markup
```
