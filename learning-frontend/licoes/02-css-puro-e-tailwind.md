# Lição 02: da página sem estilo ao Tailwind

A etapa tem quatro commits com o mesmo conteúdo:
- **2a:** só HTML, sem nenhum CSS e sem `className`;
- **2b:** classes num arquivo `.css`, como no projeto da Rocketseat;
- **2c:** as mesmas regras traduzidas para Tailwind, com a cor do botão como valor arbitrário;
- **2d:** a cor do botão vira um token no `tailwind.config.ts`.

## Etapa 2a: sem estilo

O `ProjectsPage.tsx` tem só as tags. O `index.css` foi apagado, junto com o import dele no `main.tsx`, então nenhum arquivo de estilo do projeto chega ao navegador.

### Sem CSS do projeto não quer dizer sem CSS nenhum

A página não aparece como texto cru. O título é grande e em negrito, a lista tem bolinhas e recuo, há espaço entre os parágrafos e o botão tem a aparência cinza do sistema operacional. Tudo isso vem da folha de estilo padrão do navegador, que ele aplica a toda página.

Para ver essa folha, abra o F12, selecione o `<h1>` na aba Elements e olhe o painel Styles. As regras aparecem marcadas como "user agent stylesheet", e uma delas é `font-size: 2em; font-weight: bold`.

Cada navegador tem a sua folha padrão, com pequenas diferenças entre eles. É por isso que o CSS da etapa 2b começa com um reset, que zera margens e espaçamentos para que a página parta do mesmo ponto em qualquer navegador.

### As tags dizem o que cada coisa é

A página não tem nenhuma `div`. Cada pedaço usa a tag que diz o que ele é:

| Tag | Significado |
|---|---|
| `main` | conteúdo principal |
| `header` | cabeçalho |
| `h1` e `h2` | títulos |
| `ul` e `li` | lista e itens |
| `p` | parágrafo |
| `button` | ação clicável |

É justamente sem CSS que se vê que as tags já têm comportamento próprio:
- O `h1` é maior do que o `h2`.
- A lista tem marcadores.
- O `button` recebe foco com Tab e dispara o clique com Enter e Espaço sem nenhuma linha de código. Uma `div` com clique não faz nada disso.
- Um leitor de tela anuncia "lista, 3 itens" ao chegar no `ul`.

A `div` não tem aparência nem comportamento: ela só agrupa. Ela aparece pela primeira vez na etapa 3, para agrupar título e descrição ao lado do ícone de lixeira.

### `type="button"`

O tipo padrão de um `button` é `submit`, e um `submit` dentro de um `<form>` envia o formulário. Aqui não há formulário, mas na etapa 5 o botão "Cancelar" fica dentro do formulário de criação, e sem `type="button"` ele enviaria o formulário em vez de fechar o modal.

## Etapa 2b: CSS puro

O que muda em relação à 2a:
- **`src/index.css` volta**, agora com o reset e o estilo do `body`, e o `main.tsx` volta a importá-lo. Ele fica separado do `ProjectsPage.css` porque vale para a aplicação inteira: se houvesse uma segunda página, ela também precisaria do reset, e não faria sentido depender do arquivo de outra página.
- **`src/features/projects/pages/ProjectsPage.css` é criado**, com as classes da página.
- **`ProjectsPage.tsx`** ganha `import './ProjectsPage.css'` e um `className` em cada tag.

### Como o CSS chega à página

No projeto da Rocketseat, o `index.html` tinha um `<link rel="stylesheet" href="style.css">`. Aqui não existe `<link>`: o componente faz `import './ProjectsPage.css'`.

JavaScript não sabe o que fazer com CSS, então quem resolve esse import é o Vite. Em desenvolvimento, ele transforma o arquivo CSS num pequeno módulo JavaScript que, ao rodar, cria uma tag `<style>` dentro do `<head>` com as regras do arquivo. Você vê essas tags no F12, abrindo o `<head>` na aba Elements. No `npm run build`, o Vite junta todo o CSS importado num único arquivo `.css` e coloca um `<link>` no `index.html` final.

Então `import './ProjectsPage.css'` quer dizer "este CSS precisa estar na página sempre que este componente estiver".

### O CSS continua global, mesmo importado por um componente

Esse é o maior problema do CSS clássico num projeto React, e é o argumento para a etapa 2c.

A classe `.project-card` foi escrita em `ProjectsPage.css`, mas ela vale para qualquer elemento com `className="project-card"` em qualquer lugar da aplicação, e não só dentro da `ProjectsPage`. O import decide quando o arquivo é carregado, não onde as regras valem.

Num projeto com dezenas de telas, como o dash, duas pessoas podem criar uma classe `.card` em arquivos diferentes. A que for carregada por último sobrescreve a outra, e o bug aparece numa tela que ninguém mexeu.

Existem três saídas:
1. **Convenção de nomes**, como o BEM (`.project-card__title`), em que o nome carrega o contexto.
2. **CSS Modules**, num arquivo `ProjectsPage.module.css`, cujas classes o Vite renomeia para nomes únicos.
3. **Classes utilitárias, como no Tailwind**, em que não existe nome inventado para colidir.

### `className` em vez de `class`

O que parece HTML dentro do `.tsx` é JSX, e JSX é JavaScript (a lição 03 mostra isso em detalhe). Em JavaScript, `class` é uma palavra reservada da linguagem, então o JSX usa `className`. Pelo mesmo motivo, o `for` do `<label>` vira `htmlFor`.

### O espaço entre os cards é do pai

Os cards não têm margem. O `gap: 16px` do `.project-list` afasta um card do outro, e o `gap: 24px` do `.projects-page` afasta o cabeçalho da lista.

Quando o card virar um componente, na etapa 3, cada lugar que o usar vai decidir o próprio espaçamento, em vez de herdar uma margem embutida no card. Margem dentro de componente é um padrão comum em código gerado por IA, e vale apontar na revisão.

### Largura e altura

Os itens não têm `width` nem `height`, e o tamanho vem do conteúdo somado ao `padding`. O botão tem a largura do texto mais 16px de cada lado. Um tamanho fixo quebra quando o conteúdo muda, por exemplo com um texto maior, uma tradução ou o zoom do navegador, e aí o texto vaza ou é cortado.

Há exceções:
- **Containers da página** usam `max-width`, como os 768px do `.projects-page`, para limitar a largura sem fixá-la.
- **Ícones, imagens e botões só com ícone** costumam ter tamanho fixo, porque não têm texto que varie.
- **Campos de formulário** costumam usar `width: 100%` para ocupar a largura do pai.

## Etapa 2c: Tailwind

O que muda em relação à 2b:
- **`ProjectsPage.css` é apagado**, e o import dele sai do `ProjectsPage.tsx`.
- **`index.css` passa a ter só as três diretivas do Tailwind.** O Preflight (`@tailwind base`) faz o papel do reset.
- **Cada `className` troca o nome inventado** pelas classes utilitárias equivalentes. A cor do botão, que não existe na paleta do Tailwind, entra como valor arbitrário: `bg-[#FF856B]`.

### Tradução regra por regra

| CSS puro | Tailwind |
|---|---|
| `display: flex; flex-direction: column` | `flex flex-col` |
| `gap: 24px` | `gap-6` |
| `max-width: 768px` | `max-w-3xl` |
| `margin: 0 auto` | `mx-auto` |
| `padding: 32px` | `p-8` |
| `align-items: center` | `items-center` |
| `justify-content: space-between` | `justify-between` |
| `font-size: 24px; line-height: 32px` | `text-2xl` |
| `font-weight: 600` | `font-semibold` |
| `padding: 8px 16px` | `px-4 py-2` |
| `border-radius: 8px` | `rounded-lg` |
| `background-color: #ff856b` | `bg-[#FF856B]` |
| `color: #fff` | `text-white` |
| `font-size: 14px; line-height: 20px` | `text-sm` |
| `font-weight: 500` | `font-medium` |
| `.button-primary:hover { opacity: 0.9 }` | `hover:opacity-90` |
| `gap: 16px` | `gap-4` |
| `padding: 16px` | `p-4` |
| `border: 1px solid #d4d4d4` | `border border-neutral-300` |
| `background-color: #fff` | `bg-white` |
| `margin-top: 4px` | `mt-1` |
| `color: #737373` | `text-neutral-500` |

**Escala de espaçamento.** O número da classe multiplicado por 4 dá o valor em pixels: `mt-1` é 4px, `p-4` é 16px, `gap-6` é 24px e `p-8` é 32px. Internamente, o Tailwind usa `rem` (`p-4` é `1rem`), que equivale a 16px no tamanho de fonte padrão do navegador.

**Regras que somem na tradução.** Algumas regras do CSS puro não têm classe equivalente, porque o Preflight já as aplica a todo elemento:
- `list-style: none` na lista;
- `border: none`, `cursor: pointer` e `font-family: inherit` no botão.

## Etapa 2d: token de cor

O que muda em relação à 2c:
- **`tailwind.config.ts` ganha `colors: { primary: '#FF856B' }`**, e o Tailwind passa a gerar `bg-primary`, `text-primary`, `border-primary` e as demais variantes.
- **O botão troca `bg-[#FF856B]` por `bg-primary`.**

Numa página só, o valor arbitrário não incomoda. Com a cor repetida em vários componentes, ele traz dois problemas:
1. Trocar a cor exigiria procurar e substituir em todos os arquivos.
2. Um erro de digitação, como `#FF856C`, criaria uma cor quase igual que ninguém percebe na revisão.

Com o token, a cor fica num lugar só e é usada por nome.

Depois de alterar o `tailwind.config.ts`, reinicie o `npm run dev`, pelo motivo explicado na lição 01.

## Contornar elementos para depurar

Para ver os limites de um elemento: `outline outline-2 outline-red-500`

## Commits

```
feat: build unstyled projects page with semantic tags only so the team sees browser defaults before any CSS
```

```
feat: add plain CSS classes to the projects page with a global reset to show classic styling before Tailwind
```

```
refactor: translate projects page styles from plain CSS to Tailwind utilities with the brand color as an arbitrary value
```

```
refactor: move the brand color into a primary Tailwind token so every component uses the same named color instead of copying the hex value
```

```
docs: comment Tailwind classes in the projects page with pixel equivalents so readers unfamiliar with the scale understand them
```
