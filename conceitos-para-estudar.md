# Conceitos para estudar

Lista do que precisa ser entendido para apresentar o workshop e responder perguntas. A ordem segue a do projeto. Cada item diz o que é, onde aparece na demo e o que perguntar no chat de estudo.

Fontes principais:
- react.dev, seção Learn (documentação oficial do React)
- Full Stack Open, partes 0, 1 e 2 (fullstackopen.com)
- MDN Web Docs para HTML, CSS e JavaScript (developer.mozilla.org)

Sugestão de abertura para o chat de estudo: "Estou preparando um workshop de frontend com React, TypeScript e Tailwind. Explique [conceito] com um exemplo pequeno, depois me faça 3 perguntas para checar se entendi."

## 1. HTML e CSS

| Conceito | O que é | Onde aparece |
|---|---|---|
| div e tags semânticas | div agrupa sem significado; `button`, `a`, `input`, `header`, `main`, `ul` têm significado | Toda a página |
| Box model | Conteúdo, padding, border e margin | Card, modal |
| width e height | Tamanho fixo, relativo (%) e automático | Modal, card |
| Flexbox | Organiza filhos em linha ou coluna e os alinha | Lista, cabeçalho, ícone com texto |
| position fixed e z-index | Coloca o modal por cima da página | Fundo escuro do modal |
| Pseudo-classes | `:hover`, `:active`, `:disabled`, `:focus` | Hover do card, clique e botão desabilitado |
| transition e transform | Animação suave e `scale` no clique | Botões |

Perguntar: diferença entre padding e margin; por que `justify-content` e `align-items` trocam de eixo com `flex-direction`; por que o modal precisa de `fixed`.

## 2. Tailwind

| Conceito | O que é |
|---|---|
| Classes utilitárias | Cada classe é uma propriedade CSS (`p-4` é `padding: 1rem`) |
| Escala | `p-4`, `gap-2`, `w-full` seguem uma escala de espaçamento |
| Valores arbitrários | `p-[13px]`, `bg-[#FF856B]` fogem da escala |
| Variantes | `hover:`, `active:`, `disabled:`, `focus:` |
| Tokens | Cores nomeadas no `tailwind.config` (`bg-primary`) em vez de hex na mão |

Perguntar: por que tokens são melhores que hex escrito na mão.

## 3. JavaScript e TypeScript (o mínimo para ler um `.tsx`)

| Conceito | Onde aparece |
|---|---|
| `const` e `let` | Todo arquivo |
| Funções e arrow functions (`() => {}`) | Componentes, handlers |
| `import` e `export` (default e nomeado) | Topo e fim de todo arquivo |
| Desestruturação (`{ title, description }`) | Props dos componentes |
| Template string (`` `/projects/${id}` ``) | URL do DELETE |
| `?.` e `??` | Descrição opcional |
| `.map` e `.filter` | Listagem |
| Promise, `async` e `await` | Chamadas ao backend |
| `fetch` | `projectsApi.ts` |
| `type` e `interface` | `Project`, props dos componentes |
| `string \| null` versus campo opcional (`description?: string`) | Descrição opcional; o backend sempre envia a chave, com `null` quando vazia |
| Spread (`...`) | Passar props e montar objetos |

Perguntar: diferença entre JavaScript e TypeScript; o que acontece se o TypeScript reclamar mas o código rodar; o que é uma Promise.

## 4. React

| Conceito | O que é | Onde aparece |
|---|---|---|
| Componente | Função que recebe props e devolve JSX | Todos em `components/` |
| JSX | HTML dentro do JavaScript; usa `className` | Todo componente |
| Props | Dados que o componente recebe de quem o usa | `ProjectCard` |
| `children` | O que vai entre a abertura e o fechamento do componente | `Modal` |
| Composição | Componentes dentro de componentes | Página |
| Renderização condicional | `&&` e ternário no JSX | Modal aberto, descrição, estados da lista |
| Listas e `key` | `.map` gera elementos; `key` identifica cada um | `ProjectsPage` |
| Eventos | `onClick`, `onChange`, `onSubmit` | Botões, formulário |
| `useState` | Valor que, ao mudar, redesenha a tela | Modal aberto, campos, projeto a apagar |
| Input controlado | Valor do input vem do estado | `NewProjectForm` |
| Elevar estado | Estado fica no pai; filho avisa por callback | `onDelete` do card para a página |
| `useEffect` | Código que roda após a tela aparecer, para falar com algo fora do React | Buscar a lista; ouvir a tecla Esc |
| Array de dependências | Controla quando o efeito roda de novo | `useEffect` do `useProjects` |
| Cleanup do efeito | Função que desfaz o efeito (remover listener) | Esc do modal |
| `useRef` | Referência que não redesenha a tela; aponta para elemento do DOM | Foco no campo de título |
| Hook customizado | Função `useAlgo` que agrupa hooks e lógica | `useProjects` |
| Re-renderização | Quando e por que o React redesenha um componente | Toda interação |

Leituras do react.dev: "Your First Component", "Passing Props to a Component", "Conditional Rendering", "Rendering Lists", "Responding to Events", "State: A Component's Memory", "Sharing State Between Components", "Synchronizing with Effects", "You Might Not Need an Effect", "Referencing Values with Refs", "Manipulating the DOM with Refs", "Reusing Logic with Custom Hooks", "Thinking in React".

Perguntar: por que não posso mudar uma variável comum e esperar a tela atualizar; quando NÃO usar `useEffect`; diferença entre `useRef` e `useState`; o que acontece se eu esquecer o cleanup.

## 5. Integração frontend e backend

| Conceito | Onde aparece |
|---|---|
| Métodos HTTP (GET, POST, DELETE) e status (200, 201, 204, 404, 422) | `projectsApi.ts` |
| JSON no corpo e header `Content-Type` | POST |
| `response.ok` e tratamento de erro | `projectsApi.ts`, estado de erro |
| Camada de service | Separar "como chamar a API" de "como mostrar" |
| Variável de ambiente (`import.meta.env.VITE_API_URL`) | `shared/api/client.ts` |
| CORS | Por que o navegador bloqueia chamadas sem liberação do backend |
| Aba Network do F12 | Ver requisição, status e resposta |

Perguntar: por que `fetch` não lança erro em um 404; o que é CORS e por que só o navegador reclama.

## 6. Acessibilidade de modal e Radix

| Conceito | O que é |
|---|---|
| Fechar com Esc | Feito na demo com `useEffect` |
| Foco preso | Tab não sai do modal enquanto ele está aberto |
| Devolver foco | Ao fechar, o foco volta ao botão que abriu |
| Travar rolagem | A página atrás não rola |
| `role="dialog"` e `aria-modal` | Leitor de tela entende que é um diálogo |
| Radix e shadcn | Radix entrega componentes com isso pronto; shadcn é o Radix com estilo, usado em `components/ui` no dash |

Perguntar: o que o `Dialog` do Radix faz que o modal da demo não faz.

## 7. React Query (etapa opcional)

| Conceito | O que é |
|---|---|
| Server state | Dado que pertence ao backend; a tela só tem uma cópia |
| `useQuery` | Busca e guarda carregando, erro e dados, com cache |
| `useMutation` e invalidação | Escreve no backend e manda buscar a lista de novo |

Perguntar: o que o React Query faz que o `useProjects` com `useEffect` não faz.

## 8. Ferramentas

| Ferramenta | Para quê |
|---|---|
| Vite | Servidor de desenvolvimento e build |
| `package.json` e `npm run dev` | Dependências e scripts |
| React DevTools | Ver a árvore de componentes, props e estado |
| F12: Elements, Console, Network | Inspecionar HTML e CSS, ver erros, ver requisições |
