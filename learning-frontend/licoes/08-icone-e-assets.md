# Lição 08: ícone da aba e a pasta `assets`

| Arquivo | O que mudou |
|---|---|
| `src/assets/brand/avaliai-icon.svg` | Novo. O ícone do avaliAI, copiado de `dash/frontend/public/favicon.svg` |
| `index.html` | Ganhou a linha que aponta o ícone da aba |

## O ícone da aba

```html
<link rel="icon" type="image/svg+xml" href="/src/assets/brand/avaliai-icon.svg" />
```

- **`rel="icon"`** diz ao navegador que o arquivo é o ícone da aba (o favicon).
- **`type="image/svg+xml"`** informa o formato: SVG.
- **`href`** é o caminho do arquivo.

## A pasta `src/assets`

`src/assets` guarda arquivos que não são código, como imagens, ícones e logotipos, e que são usados pelo código do projeto. A arquitetura do dash organiza essa pasta por finalidade:

| Subpasta | Conteúdo |
|---|---|
| `brand/` | Identidade visual: logotipos, símbolo e marcas institucionais |
| `icons/` | Ícones próprios do produto, que não vêm de bibliotecas como o `lucide-react` |
| `illustrations/` | Ilustrações de estado vazio, onboarding e telas explicativas |

O ícone da aba é o símbolo do avaliAI, por isso fica em `brand/`.

### O que o Vite faz com os arquivos de `assets`

O Vite processa os arquivos de `src/assets` que são referenciados pelo `index.html` ou importados no código. No `npm run build`, ele:

1. copia o arquivo para `dist/assets/`;
2. acrescenta ao nome um código calculado a partir do conteúdo, como `avaliai-icon-CAn1vSyf.svg`;
3. troca o caminho no `index.html` pelo nome novo.

O código no nome resolve um problema de cache. O navegador guarda arquivos já baixados para não baixá-los de novo. Se o ícone mudar, o conteúdo muda, o código muda, e o nome muda junto. O navegador vê um arquivo novo e o baixa, em vez de continuar mostrando o antigo guardado.

Um arquivo de `assets` que ninguém referencia não vai para o `dist`.

### Usar uma imagem de `assets` num componente

Num componente, a imagem é importada como se fosse código:

```tsx
import logo from '../../../assets/brand/avaliai-icon.svg'

<img src={logo} alt="avaliAI" />
```

O `import` devolve o caminho final do arquivo, já com o código no nome depois do build, e esse caminho vai no `src` da `<img>`. Se o arquivo for renomeado ou apagado, o import quebra e o build acusa o erro, em vez de a imagem sumir em silêncio da tela.

## `assets` ou `public`

O Vite também tem a pasta `public/`, na raiz do frontend, com um comportamento diferente:

| | `src/assets` | `public` |
|---|---|---|
| Como é usado | Referenciado no `index.html` ou importado no código | Pelo caminho fixo, como `/favicon.svg` |
| No build | Nome ganha um código e o caminho é atualizado | Copiado para o `dist` sem nenhuma mudança |
| Se o arquivo não existir | O build acusa o erro | Ninguém avisa; a imagem só não aparece |
| Uso típico | Imagens usadas pelas telas | Arquivos que precisam de nome e endereço fixos, como `robots.txt` |

O dash guarda o favicon em `public/favicon.svg`, que também é uma prática comum. A demo usa `src/assets` para o favicon também passar pelo processamento do Vite e para mostrar a pasta `assets` funcionando.

## Commit

```
feat: add the avaliAI icon to the browser tab from the brand assets folder to show how Vite processes assets
```
