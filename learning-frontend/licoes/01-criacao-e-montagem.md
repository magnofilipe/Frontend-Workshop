# Lição 01: criar o frontend e entender a ordem de montagem

## Parte 1: as ferramentas antes do código

### Node e npm

O código do frontend roda no navegador, mas as ferramentas que preparam esse código (o Vite, o TypeScript, o Tailwind) são programas JavaScript que rodam no seu computador, e quem roda JavaScript fora do navegador é o Node. Então, neste projeto, o Node não executa a sua página: ele executa as ferramentas que transformam e entregam a página ao navegador.

O `npm` vem junto com o Node e cumpre o papel que o `pip` cumpre no Python. A comparação com a lição 00 é direta:

| Python | JavaScript |
|---|---|
| `pip` | `npm` |
| `requirements.txt` | `package.json` |
| `.venv` | `node_modules` |
| não existe por padrão | `package-lock.json` |

A última linha resolve o problema que apareceu na lição 00. No `package.json`, as versões vêm com faixas, como `"react": "^18.3.1"`, em que o `^` quer dizer "qualquer versão a partir de 18.3.1 que ainda comece com 18". Na primeira vez que alguém roda `npm install`, o npm escolhe as versões exatas dentro dessas faixas e grava cada uma no `package-lock.json`. Esse arquivo vai para o git, e quando outra pessoa roda `npm install`, o npm segue o lock em vez de escolher de novo, então todos ficam com as mesmas versões. A `node_modules`, assim como a `.venv`, fica fora do git.

### Vite

O navegador só entende HTML, CSS e JavaScript. Ele não entende TypeScript, nem JSX (o HTML escrito dentro do JavaScript), nem `import` de um arquivo `.css`. O Vite é o servidor de desenvolvimento que fica entre o seu código e o navegador: quando o navegador pede `main.tsx`, o Vite lê o arquivo, apaga os tipos do TypeScript, transforma o JSX em JavaScript comum e só então envia o resultado. Ele também observa os arquivos, e quando você salva algo, avisa o navegador para atualizar só o trecho que mudou, sem recarregar a página. Isso se chama HMR (Hot Module Replacement).

Na hora de publicar, `npm run build` faz a mesma transformação de uma vez e gera a pasta `dist`, com arquivos prontos para qualquer servidor.

O dash usa a variante SWC do plugin de React. SWC é o programa que faz a transformação do TypeScript e do JSX, escrito em Rust e mais rápido do que o padrão (Babel). Para você, o resultado é igual, e usamos a mesma variante só para ficar idêntico ao dash.

### Tailwind, PostCSS e Autoprefixer

O Tailwind não é uma biblioteca carregada no navegador. Ele roda no seu computador, lê os seus arquivos procurando nomes de classe como `p-4` e `flex`, e gera um CSS que contém apenas as classes encontradas. Quem o executa é o PostCSS, uma ferramenta que recebe um CSS, passa por uma fila de plugins e devolve um CSS transformado. O Vite roda o PostCSS sozinho quando encontra o arquivo `postcss.config.js`. Nessa fila entram dois plugins:

- `tailwindcss`, que gera as classes;
- `autoprefixer`, que adiciona as versões com prefixo que alguns navegadores ainda exigem, como `-webkit-`.

Daqui sai uma consequência que vale ouro na revisão de código gerado por IA. Como o Tailwind só procura texto, uma classe montada em tempo de execução, como `` `bg-${cor}-500` ``, nunca é encontrada e o estilo simplesmente não existe. Esse é um bug clássico de código gerado.

### dependencies e devDependencies

`npm install pacote` grava o pacote em `dependencies`, e `npm install -D pacote` grava em `devDependencies`. A ideia é separar o que a aplicação usa enquanto roda (React) das ferramentas que só existem para construir (Tailwind, TypeScript, Vite).

Num frontend com Vite, essa separação é mais uma declaração de intenção do que uma regra, porque o Vite inclui no resultado final qualquer coisa que o código importe, esteja na lista que estiver. Mesmo assim, siga a convenção, porque é o que todo mundo espera ler.

## Parte 2: comandos

Abra um terminal novo, porque o outro está ocupado com o uvicorn. Rode um comando de cada vez.

```powershell
cd C:\Users\splab\Desktop\AvaliAI\Workshops\Frontend-Workshop\learning-frontend\workshop-demo
```

```powershell
npm create vite@5.5.5 frontend -- --template react-swc-ts
```
O `npm create vite` é um atalho para baixar e executar o pacote `create-vite`, um gerador que copia um projeto modelo para uma pasta nova. O `@5.5.5` fixa a versão do gerador. A versão atual cria projetos com React 19, e o dash usa React 18, então usamos a última versão do gerador que ainda cria projetos com React 18 e Vite 5. A palavra `frontend` é o nome da pasta. O `--` sozinho avisa ao npm que o que vem depois não é para ele, e sim para o gerador, e `--template react-swc-ts` escolhe o modelo React, TypeScript e SWC.

```powershell
cd frontend
npm install
```
O `npm install` lê o `package.json`, baixa tudo para a `node_modules` e cria o `package-lock.json`.

```powershell
npm install -D tailwindcss@3 postcss autoprefixer
```
O `@3` garante o Tailwind 3, igual ao dash. A versão 4 mudou a forma de configurar.

```powershell
npx tailwindcss init -p --ts
```
O `npx` executa um programa que está instalado dentro da `node_modules` do projeto, e não no computador inteiro. Aqui ele executa o Tailwind pedindo para criar o arquivo de configuração. O `-p` cria também o `postcss.config.js`, e o `--ts` cria a configuração em TypeScript (`tailwind.config.ts`), como no dash.

```powershell
npm run dev
```
O `npm run` executa um script do `package.json`, e o script `dev` é `vite`. O terminal mostra o endereço `http://localhost:5173` e fica preso enquanto o servidor estiver no ar, como acontece com o uvicorn.

## Parte 3: o que você vai escrever

O modelo criado pelo gerador traz uma página de exemplo com um contador e os logotipos do Vite e do React. Você vai trocar esse conteúdo pela estrutura da demo.

### Apagar o que não será usado

- `src/App.css`
- `src/assets/` (a pasta inteira)
- `public/vite.svg`

### Ajustar `tailwind.config.ts`

O campo `content` diz ao Tailwind em quais arquivos ele deve procurar classes. Preencha com o `index.html` e todos os `.ts` e `.tsx` dentro de `src`. Se esse campo ficar vazio, nenhuma classe é gerada e nada é estilizado, sem nenhuma mensagem de erro.

### Trocar o conteúdo de `src/index.css`

Apague tudo e deixe só as três diretivas do Tailwind:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`base` é o Preflight, um reset que zera os estilos padrão do navegador: os títulos perdem o tamanho e o negrito, as listas perdem as bolinhas e as margens somem. `components` é onde ficariam classes de componente. `utilities` são as classes do dia a dia, como `p-4` e `flex`.

### Criar a estrutura de pastas

```
src/
├── index.css
├── vite-env.d.ts                     (já existe, não mexa)
├── app/
│   ├── main.tsx                      (movido de src/main.tsx)
│   └── App.tsx                       (movido de src/App.tsx e reescrito)
└── features/projects/pages/
    └── ProjectsPage.tsx              (novo)
```

As outras pastas (`components`, `hooks`, `services`, `types` e `shared`) nascem nas etapas em que forem usadas, porque o git não guarda pasta vazia.

### Os arquivos

**`index.html`**
- Troque `lang="en"` por `lang="pt-BR"`.
- Troque o título para `Projetos`.
- Apague a linha do ícone (`vite.svg`).
- Aponte o `<script>` para o novo lugar do `main.tsx`.

**`src/app/main.tsx`**
- Ajuste os caminhos dos imports, porque o arquivo mudou de pasta.
- Mantenha o `StrictMode`.
- Use import nomeado para o `App`. A diferença entre os tipos de import está explicada logo abaixo.

**`src/app/App.tsx`**
- Uma função `App` exportada com nome, que devolve `<ProjectsPage />`.
- Hoje ela só repassa a página. Num projeto com várias telas, é aqui (ou em `router.tsx`, como diz a arquitetura do dash) que entram as rotas e os providers.

**`src/features/projects/pages/ProjectsPage.tsx`**
- Uma função `ProjectsPage` exportada com nome, que devolve um `<main>` com um `<h1>` escrito "Projetos".

### Duas formas de exportar

O modelo usa `export default App`, e o import correspondente é `import App from './App'`, em que quem importa escolhe o nome que quiser. A outra forma é `export function App()`, cujo import é `import { App } from './App'`, com chaves e o nome exato. O dash usa a segunda forma em cerca de 80% dos arquivos e ela é melhor para busca, porque o nome é sempre o mesmo em todo o projeto. A lição 03 aprofunda isso.

## Parte 4: a ordem de montagem

Com o projeto rodando, abra o F12 na aba Network, marque "Disable cache" e recarregue a página. A lista de pedidos que aparece é a resposta à pergunta "o que é construído primeiro", na ordem em que aconteceu.

**1. O navegador pede a página e recebe o `index.html`.** É o primeiro pedido da lista, chamado `localhost`. O HTML tem pouca coisa: um `<div id="root"></div>` vazio e um `<script type="module">` apontando para `main.tsx`. O navegador lê o arquivo de cima para baixo, cria a div vazia e, ao encontrar o script, pede o arquivo indicado.

**2. O navegador pede o `main.tsx`, e o Vite entrega JavaScript.** Clique em `main.tsx` na aba Network e abra a aba Response. O que chegou não é o seu arquivo: os tipos sumiram, e o `<App />` virou uma chamada parecida com `jsxDEV(App, {})`. Isso mostra duas coisas. A primeira é que o TypeScript é apagado antes de chegar ao navegador. A segunda é que JSX não é HTML, e sim uma forma mais legível de escrever chamadas de função.

**3. Os imports são buscados antes de o código rodar.** Um arquivo com `type="module"` não executa nenhuma linha até que todos os seus imports tenham chegado. Por isso aparecem na lista, depois do `main.tsx`, o React, o `index.css`, o `App.tsx` e, depois dele, o `ProjectsPage.tsx`, porque cada arquivo puxa os imports do seu próprio topo. Também por isso os imports ficam sempre no começo dos arquivos.

Na lista também aparecem pedidos que não vêm do seu código:
- `client`, que é o código do Vite que mantém a conexão para o HMR;
- `@react-refresh`, a parte do HMR específica do React;
- arquivos com `?v=` no nome, que são as bibliotecas da `node_modules` já preparadas pelo Vite.

**4. O `main.tsx` roda.** `document.getElementById('root')` encontra a div vazia, `createRoot` entrega essa div ao React, e `render(...)` diz o que deve ser desenhado nela.

**5. O React percorre a árvore de cima para baixo, chamando funções.** A regra que decide tudo é a primeira letra do nome da tag:
- Ao encontrar `<App />`, com letra maiúscula, o React entende que é um componente, ou seja, uma função, e a chama.
- `App` devolve `<ProjectsPage />`, também com maiúscula, e o React chama `ProjectsPage`.
- `ProjectsPage` devolve `<main>` e `<h1>`, com minúscula, que são tags HTML. O React para de descer naquele ramo, porque não há mais funções a chamar.

Essa regra é também a diferença entre div e componente vista pelo código: `div` é uma tag que vira um elemento na tela, e `ProjectsPage` é uma função que o React chama para descobrir que tags ela devolve.

**6. O React cria os elementos de verdade e os coloca na div.** Com a árvore inteira resolvida, o React cria os elementos `main` e `h1` e os insere dentro de `#root` de uma vez, e só então o navegador desenha. Essa fase se chama commit.

Resumindo, primeiro chega o HTML, que é uma casca vazia. Depois chegam os arquivos JavaScript, puxados pelos imports. Em seguida o React chama os componentes do topo (`App`) até as folhas (as tags HTML). Por último, ele insere tudo de uma vez na página.

### O `!` depois de `getElementById`

O TypeScript sabe que `getElementById` devolve `null` quando não existe elemento com aquele id, e o `createRoot` não aceita `null`. O `!` diz ao TypeScript que você garante que o valor não é `null`, e com isso ele para de reclamar. Repare que o `!` é só uma promessa e não verifica nada: se a promessa for falsa, o erro acontece quando a página roda. Um dos exercícios abaixo quebra essa promessa de propósito.

### StrictMode

`StrictMode` é um componente do React que não desenha nada. Ele só liga verificações extras, e apenas em desenvolvimento. A principal é chamar cada componente duas vezes seguidas, porque um componente precisa ser puro: com as mesmas entradas, ele deve devolver sempre o mesmo resultado, sem alterar nada fora de si. O React pode chamar um componente quantas vezes quiser, então um componente que altera algo externo enquanto é chamado se comporta de forma imprevisível. Chamar duas vezes é o jeito do React de fazer esse tipo de erro aparecer cedo. Na lição 04, o mesmo `StrictMode` vai fazer o `useEffect` rodar duas vezes, e o motivo é parecido.

O dash não usa `StrictMode`, como dá para ver em `dash/frontend/src/main.tsx`, então lá essas verificações estão desligadas. É bom saber disso caso alguém compare os dois projetos.

### Pastas: por que estão organizadas assim

A demo organiza por funcionalidade (feature), e não por tipo de arquivo. Tudo que é de "projetos" (página, componentes, hooks, chamadas ao backend e tipos) mora em `features/projects`. O que serve para qualquer funcionalidade, sem regra de negócio, mora em `shared`. E o que liga a aplicação mora em `app`.

| Pasta | O que guarda | Exemplo na demo |
|---|---|---|
| `app/` | Inicialização: onde o React começa e o que envolve a aplicação inteira | `main.tsx`, `App.tsx` |
| `features/projects/pages/` | O componente que representa uma tela inteira | `ProjectsPage` |
| `features/projects/components/` | Pedaços de tela que só fazem sentido para projetos | `ProjectCard` |
| `features/projects/hooks/` | Funções `useAlgo` que guardam estado e lógica para os componentes | `useProjects` |
| `features/projects/services/` | Funções que conversam com o backend | `projectsApi` |
| `features/projects/types/` | Os formatos dos dados | `Project` |
| `shared/components/` | Componentes genéricos, sem regra de negócio | `Modal`, `Button` |
| `shared/api/` | Configuração comum das chamadas HTTP, como o endereço do backend | `client.ts` |

As dependências seguem uma direção só: `app` importa de `features`, `features` importa de `shared`, e `shared` nunca importa de `features`. É por isso que um `Modal` em `shared` não pode saber o que é um projeto.

O dash está no meio de uma migração. A pasta `src` dele tem `features/` e `shared/`, que são a estrutura nova, e também `components/`, `pages/`, `hooks/`, `lib/`, `utils/` e `data/`, que são a estrutura antiga, organizada por tipo de arquivo. Quem abre o dash encontra as duas organizações convivendo, e isso torna difícil saber onde cada coisa deve ficar.

## Parte 5: preveja antes de rodar

Para cada item, escreva a sua previsão antes de testar e depois compare.

1. Com a página aberta, aperte `Ctrl+U` para ver o código-fonte e depois olhe a aba Elements do F12. O que você espera encontrar dentro de `<div id="root">` em cada um dos dois?
2. Escreva o `<h1>Projetos</h1>` ainda sem nenhuma classe. Ele vai aparecer grande e em negrito, como um título normal? Depois adicione `text-2xl font-semibold` e veja a diferença.
3. Coloque `console.log('ProjectsPage chamada')` dentro da função `ProjectsPage`, antes do `return`. Onde essa mensagem aparece, no terminal onde roda o `npm run dev` ou no console do navegador? E quantas vezes ela aparece? Depois tire o `<StrictMode>` do `main.tsx`, recarregue, compare e volte o `StrictMode` para o lugar.
4. No `index.html`, troque `id="root"` por `id="app"` sem mexer no `main.tsx`. O que acontece na tela e no console? Desfaça depois.

## Parte 6: perguntas de checagem

1. Se o `npm run dev` estiver desligado e o uvicorn ligado, o que aparece ao abrir `localhost:5173`? E ao abrir `localhost:8000/projects`?
2. Por que o `package-lock.json` vai para o git e a `node_modules` não?
3. Ao ler `<ProjectCard title="X" />` e `<div className="p-4">`, como você sabe qual é componente e qual é tag HTML, e o que o React faz de diferente com cada um?

## Quando terminar

Me mande os seus arquivos para revisão, ou só me avise que já estão salvos e eu leio direto da pasta. Mande também as suas previsões com o que de fato aconteceu e as respostas às perguntas de checagem. A minha versão está em `solucoes/etapa-1/`, e o ideal é olhar só depois de tentar.

Depois de revisado, faça o commit da etapa 1 em `workshop-demo`. Uma sugestão de mensagem:

```
feat: scaffold Vite React frontend with Tailwind and feature folders so the workshop can show how the page mounts
```
