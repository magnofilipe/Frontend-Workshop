# Roteiro do Workshop de Frontend (avaliAI)

## 1. Abertura
- Resultado da entrevista, sem nomes: ninguém definiu componente da mesma forma, ninguém entende as pastas, quase ninguém sabe como o front se conecta ao back.
- Objetivo: ao final, saber o que é uma div, o que é um componente, como uma página é montada e onde o frontend conversa com o backend.

## 2. Slides: div e CSS
1. Significado de div: caixa sem significado que agrupa e posiciona outras coisas. Exemplos com páginas do avaliAI, desenhando caixas por cima de cada pedaço.
2. Box model: conteúdo, padding, border e margin.
3. Tamanho: width e height.
4. Flexbox: `display: flex`, `flex-direction`, `justify-content`, `align-items` e `gap`. Exemplo: alinhar ícone ao lado de um texto.
5. Tradução para Tailwind: `flex`, `flex-col`, `justify-between`, `items-center`, `gap-4`, `p-4`, `w-full`.

## 3. Slides: componente
1. O problema: cinco cards iguais copiados cinco vezes.
2. Definição: componente é uma função que recebe dados (props) e devolve um pedaço de tela.
3. Div versus componente: div é uma tag de HTML; componente é uma função que pode devolver divs e outros componentes.
4. Props: o mesmo card com dados diferentes.
5. Composição: página feita de componentes, que são feitos de outros componentes e divs. Árvore de uma tela do avaliAI.

## 4. Código por commits (sem slides)
O código chega pronto. A cada etapa, avançar para o commit correspondente, mostrar o diff e explicar por que as mudanças funcionam.

### O projeto
Uma única página de projetos.

- Lista os projetos em cards (componente de listagem).
- Projeto tem título (obrigatório) e descrição (opcional).
- Botão "Novo projeto" abre um modal com formulário de criação.
  - Botão "Criar" fica desabilitado enquanto o título estiver vazio.
  - Ao abrir, o foco vai para o campo de título.
- Cada card tem um ícone de lixeira que abre um modal de confirmação, no mesmo estilo do modal de criação.
- O modal fecha com Esc, com botão de cancelar e clicando fora.
- Após criar ou apagar, a lista é buscada de novo no backend.
- Estados da lista: carregando, erro e vazia.
- Card tem hover e não é clicável. Botões têm animação de clique.

### Stack
Vite, React 18, TypeScript, Tailwind 3 e lucide-react (ícones). Mesma base do dash. React Query só entra na etapa opcional.

### Estrutura de pastas
Versão reduzida da "Arquitetura do frontend.md" do dash, para que explicar a demo seja explicar o dash.

```
src/
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
    ├── components/Modal.tsx
    └── components/Button.tsx
```

O endereço do backend fica em `frontend/.env` (`VITE_API_URL`) e é lido em `projectsApi.ts`. Com uma feature só, um `shared/api/client.ts` seria um arquivo a mais sem uso; ele passa a fazer sentido quando outra feature também chamar o backend.

### Etapas
Cada etapa tem um commit no repositório da demo (`learning-frontend/workshop-demo`).

| # | Tempo | O que construir | Conceitos |
|---|---|---|---|
| 1 | 5 min | Mostrar as pastas e seguir `index.html`, `main.tsx`, `App.tsx` e `ProjectsPage` | Ordem de montagem, papel de cada pasta |
| 2a | 2 min | Página estática só com tags, sem nenhum CSS, com cards repetidos na mão | Tags com significado, estilo padrão do navegador |
| 2b | 5 min | A mesma página com CSS puro (classes num arquivo `.css`) | Reset, box model, flexbox, CSS importado e global |
| 2c | 4 min | A mesma página traduzida para Tailwind, com a cor do botão em `bg-[#FF856B]` | Classes utilitárias, escala, valor arbitrário |
| 2d | 1 min | A cor do botão vira o token `primary` no `tailwind.config.ts` | Token de cor |
| 3 | 10 min | Extrair `ProjectCard`, criar o tipo `Project`, usar `.map` na página, adicionar hover e o ícone de lixeira (um `ProjectList` separado fica como evolução possível, só mencionada) | Anatomia de um `.tsx`, props, tipo, key, descrição opcional |
| 4 | 12 min | `projectsApi.ts` e `useProjects` com carregando, erro e vazio, com a aba Network aberta | `useState`, `useEffect`, hook customizado, service, GET |
| 5 | 13 min | `Modal` genérico e `NewProjectForm`, com POST e recarga da lista | `children`, renderização condicional, input controlado, `useRef` (foco), `useEffect` com cleanup (Esc), POST |
| 6 | 8 min | `DeleteProjectConfirm` reutilizando o `Modal`, com DELETE e recarga | Reuso de componente, evento subindo por props (`onDelete`), DELETE |
| 7 | 5 min | Opcional: trocar o miolo do `useProjects` por `useQuery` | Hook isola a lógica; por que o dash usa React Query |

Se atrasar, corte a etapa 7.

## 5. Perguntas (15 min)
Se der tempo, abrir o `ClientDashboard.tsx` do dash e reconhecer as peças vistas na demo.

## Backend
FastAPI, Python, porta 8000, em `learning-frontend/workshop-demo/backend`. Persistência em memória, iniciando com 3 projetos. Instruções de execução no README da pasta.

### Contrato da API

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/projects` | nenhum | `200` com lista de projetos |
| POST | `/projects` | `{ "title": string, "description": string \| null }` | `201` com o projeto criado; `422` se o título estiver vazio |
| DELETE | `/projects/{id}` | nenhum | `204`; `404` se não existir |

Formato do projeto:

```json
{ "id": "string", "title": "string", "description": "string ou null" }
```

- CORS liberado para `http://localhost:5173` (porta padrão do Vite).
- O título deve ser validado no backend também, não só no botão desabilitado.

## Preparação (antes do dia)
- [ ] Backend pronto e testado.
- [ ] Frontend final pronto, com um commit por etapa.
- [ ] Ensaiar a apresentação dos commits pelo menos duas vezes, cronometrando.
- [ ] Saber simular rede lenta e offline na aba Network, para mostrar os estados de carregando e erro.
- [ ] React DevTools instalado no navegador.
- [ ] Fonte grande no editor e no navegador para o projetor.
- [ ] Slides de div, CSS e componente com telas do avaliAI.
