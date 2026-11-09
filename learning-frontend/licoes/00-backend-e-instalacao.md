# Lição 00: subir o backend e entender o que foi instalado

## Por que o frontend precisa de um backend

O frontend roda no navegador da pessoa, e tudo que está lá pode ser lido e alterado por ela, por isso os dados oficiais (os projetos) moram em outro programa, num servidor que o navegador consulta pela rede usando HTTP. Na demo, esse programa é o `main.py`, e a conversa entre os dois sempre segue o mesmo formato: o frontend manda um pedido (método, rota e, às vezes, um corpo em JSON) e o backend devolve uma resposta (status e, às vezes, um corpo em JSON). É o mesmo desenho do dash, só que com três rotas em vez de dezenas.

## As peças, de baixo para cima

**Python e o ambiente virtual (venv).** Cada projeto Python precisa das suas próprias versões de bibliotecas, e instalar tudo no Python do sistema faz um projeto quebrar o outro. O `venv` cria uma pasta `.venv` com uma cópia isolada do Python onde os pacotes deste projeto ficam guardados, e esse é o papel que a `node_modules` cumpre no frontend. A pasta não vai para o git, porque qualquer pessoa consegue recriá-la a partir do `requirements.txt`.

**pip e requirements.txt.** O `pip` é o gerenciador de pacotes do Python, e o `requirements.txt` é a lista do que o projeto precisa. A comparação direta com o frontend é que `pip` está para `npm` assim como `requirements.txt` está para `package.json`.

**FastAPI.** É o framework que transforma funções Python comuns em rotas HTTP. Quando você escreve `@app.get("/projects")` em cima de uma função, está dizendo que um GET em `/projects` executa aquela função e o que ela retornar vira o JSON da resposta. O FastAPI também valida o corpo dos pedidos usando o Pydantic (a classe `ProjectInput`), então um POST com título vazio é recusado com 422 antes da função rodar, e ele ainda gera sozinho a página `/docs`, onde você testa as rotas pelo navegador.

**uvicorn.** Para entender o uvicorn, primeiro é preciso entender o que é um servidor e o que é uma porta.

Um servidor é um programa que fica rodando sem parar, esperando mensagens chegarem pela rede. Uma máquina tem vários programas usando a rede ao mesmo tempo, por isso cada mensagem traz, além do endereço da máquina, um número de porta que diz para qual programa ela vai. Pense na máquina como um prédio e na porta como o número do apartamento. `localhost` é a própria máquina, então `http://localhost:8000/projects` quer dizer "na minha máquina, entregue ao programa da porta 8000 um pedido para `/projects`".

O `main.py` sozinho não é um servidor. Ao ser executado, ele cria a variável `app`, um objeto que fica na memória e guarda a lista de rotas e as funções de cada uma. Se você rodar `python main.py`, o objeto é criado e o programa termina logo em seguida, porque não tem nada mantendo-o vivo e ninguém escutando a porta 8000. O FastAPI sabe o que responder, mas não sabe receber nem enviar nada pela rede.

O uvicorn faz a parte da rede. Quando você roda `uvicorn main:app`, ele importa o seu `app` e avisa ao sistema operacional que as mensagens que chegarem na porta 8000 são dele, e a partir daí fica em ciclo: recebe os bytes de um pedido, transforma esse texto num pedido organizado (método, rota, cabeçalhos e corpo), entrega ao `app`, recebe a resposta que o FastAPI montou, converte de volta em bytes e envia ao navegador. Numa comparação com um restaurante, o FastAPI é a cozinha, que sabe as receitas, e o uvicorn é o atendente, que recebe os pedidos na porta e entrega os pratos. A regra que define como o atendente conversa com a cozinha se chama ASGI, e é por causa dela que o uvicorn poderia ser trocado por outro servidor sem mudar o `main.py`.

O frontend tem o mesmo esquema: `npm run dev` liga o Vite, que é um servidor na porta 5173 cujo trabalho é entregar ao navegador os arquivos da página (HTML, JavaScript e CSS). Por isso a demo tem dois servidores ligados ao mesmo tempo, o Vite entregando o código da tela e o uvicorn entregando os dados. O navegador primeiro busca a página no 5173 e depois, enquanto essa página roda, o código dela pede os projetos ao 8000. Esse segundo pedido é o momento em que o frontend se conecta ao backend.

**pytest e httpx.** Esses dois só servem para os testes. O `pytest` encontra e roda as funções que começam com `test_`, e o `TestClient` do FastAPI usa o `httpx` para fazer pedidos HTTP à API sem precisar subir o servidor de verdade.

## Comandos

Rode no PowerShell, um de cada vez, lendo o que cada um faz antes.

```powershell
cd C:\Users\splab\Desktop\AvaliAI\Workshops\Frontend-Workshop\learning-frontend\workshop-demo\backend
```
Entra na pasta do backend, porque todos os comandos seguintes dependem de estar nela.

```powershell
python -m venv .venv
```
O `-m venv` pede ao Python para rodar o módulo `venv`, que cria a pasta `.venv` com o ambiente isolado.

```powershell
.venv\Scripts\Activate.ps1
```
Ativa o ambiente, e a partir daí `python` e `pip` passam a apontar para a cópia dentro da `.venv`. O nome `(.venv)` aparece no começo da linha do terminal para indicar isso. Se o PowerShell recusar com um erro sobre "execution policy", rode uma vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e tente de novo, porque por padrão o Windows bloqueia scripts `.ps1`.

```powershell
pip install -r requirements.txt
```
O `-r` diz para ler a lista de pacotes do arquivo. O pip baixa os quatro pacotes listados e também as dependências deles, como o `pydantic` e o `starlette`, que o FastAPI usa por baixo.

```powershell
pytest -v
```
Roda os testes, e o `-v` (de verbose) mostra o nome de cada teste. Todos devem passar. Se algum falhar, me mande a saída completa, porque eu escrevi esses testes sem rodá-los, já que as instalações ficaram com você.

```powershell
uvicorn main:app --reload --port 8000
```
O `main:app` significa "no arquivo `main.py`, use a variável `app`". O `--reload` reinicia o servidor sempre que um arquivo muda, e o `--port 8000` define a porta. O terminal fica preso enquanto o servidor estiver no ar, e `Ctrl+C` o desliga.

## Verificação

1. Abra http://localhost:8000/projects e você deve ver um JSON com três projetos.
2. Abra http://localhost:8000/docs, expanda o POST, clique em "Try it out" e crie um projeto com o título `"   "`. A resposta deve ser 422.
3. Copie o `id` de um projeto, apague-o pelo DELETE e depois tente apagar o mesmo `id` de novo. A primeira resposta deve ser 204 e a segunda 404.
4. Desligue o servidor com `Ctrl+C`, ligue de novo e recarregue a lista. Os três projetos iniciais voltam, porque os dados moram na memória do processo e morrem com ele.

## Lendo o main.py

O arquivo tem quatro partes.

### Por que existem dois formatos, ProjectInput e Project

Para entender por que existem dois formatos, acompanhe um projeto desde o clique em "Criar" até ele aparecer na lista.

No modal, a pessoa digita o título e a descrição, e nesse momento o projeto só existe no formulário, ainda sem `id`. Quem gera o `id` é o backend, por dois motivos: ele guarda os dados, então é o único que sabe quais ids já existem, e o frontend roda na máquina do usuário, onde qualquer valor pode ser alterado. Assim, o frontend envia apenas título e descrição. O pedido que sai do navegador é texto, mais ou menos assim (simplificado, porque o navegador envia mais cabeçalhos):

```
POST /projects HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{"title": "Novo projeto", "description": "Teste"}
```

`ProjectInput` é a descrição, em Python, do formato desse corpo: `title` é obrigatório e precisa ser um texto não vazio, e `description` pode ser texto ou `null`. Quando o FastAPI vê `def create_project(data: ProjectInput)`, ele lê essa anotação de tipo e entende que deve pegar o corpo do pedido, converter o JSON e conferir se ele bate com o `ProjectInput`. Se não bater, o próprio FastAPI responde 422 e a função nem chega a rodar.

Se bater, a função roda. O `new_project(data)` sorteia um `id` (o `uuid4` gera um número aleatório de 128 bits, então a chance de dois iguais é desprezível), junta com o título e a descrição e forma um `Project`, que é guardado no dicionário e retornado. A anotação `-> Project` diz ao FastAPI como transformar o retorno em JSON, e a resposta sai assim:

```
HTTP/1.1 201 Created
content-type: application/json

{"id": "3f2b9c1e-...", "title": "Novo projeto", "description": "Teste"}
```

A partir daí, todo GET devolve uma lista de `Project`, cada um com o seu `id`, e é esse `id` que o frontend usa depois para apagar com `DELETE /projects/3f2b9c1e-...`.

Resumindo, o formato de entrada não tem `id` porque o projeto ainda não existe, e o formato de saída tem `id` porque o projeto já foi salvo. Esse padrão de "dados para criar" separados de "recurso salvo" aparece no dash e em praticamente qualquer API.

### Como esses formatos chegam ao TypeScript

Python e TypeScript não se enxergam, porque são programas separados que só trocam texto JSON pela rede. Quando o frontend faz `await response.json()`, recebe um objeto JavaScript, mas o TypeScript não tem como saber o formato dele e o trata como `any`, um tipo que aceita qualquer coisa. Na prática, se você escrever `project.titel` com erro de digitação, nada reclama, e a tela mostra vazio porque o campo não existe.

Para o TypeScript conferir o seu código, escrevemos à mão, em `types/project.ts`, os mesmos dois formatos do backend:

```ts
export type Project = {
  id: string
  title: string
  description: string | null
}

export type NewProject = {
  title: string
  description: string | null
}
```

A tradução é direta: `str` vira `string`, `str | None` vira `string | null` e `list[Project]` vira `Project[]`. O `Project` do Python corresponde ao `Project` do TypeScript, e o `ProjectInput` corresponde ao `NewProject`.

O tipo TypeScript tem uma limitação importante: ele é uma promessa que você faz, não uma verificação. O TypeScript é apagado antes do código chegar ao navegador, então, se um dia o backend renomear `title` para `name`, o frontend continua compilando sem erro e a tela fica vazia. Quem mantém os dois lados de acordo são as pessoas, e é para isso que existe um contrato escrito da API, como a tabela no README do backend.

Repare também que o tipo é `description: string | null` e não `description?: string`. O ponto de interrogação significaria que a chave pode nem vir no JSON, mas este backend sempre envia a chave, com `null` quando não há descrição. Essa diferença entre `null`, `undefined` e chave ausente é explicada na lição 03.

### O resto do arquivo

- `create_app` monta a API. O dicionário `projects` é o "banco de dados", e ele fica dentro da função para que cada teste crie uma API com dados próprios, sem que um teste altere o que o outro vê.
- `add_middleware(CORSMiddleware, ...)` libera o navegador para aceitar respostas desta API quando a página vem de `http://localhost:5173`. Isso fica mais claro na lição de integração, quando a gente vai quebrar o CORS de propósito para ver o erro acontecer.
- As três funções com `@app.get`, `@app.post` e `@app.delete` são as rotas do contrato.

## Perguntas de checagem

Responda com as suas palavras e me mande.

1. Se o uvicorn estiver desligado, o que o navegador recebe ao pedir `/projects`? Existe algum status HTTP nessa situação?
2. Por que a pasta `.venv` não vai para o git, e como outra pessoa consegue rodar o backend sem ela?
3. O botão "Criar" do frontend vai ficar desabilitado com o título vazio. Então por que o backend também valida o título?

## Respostas

1. Com o uvicorn desligado, ninguém está escutando a porta 8000. O navegador tenta abrir uma conexão, o sistema operacional recusa na hora, e como a conexão nunca foi aberta não houve troca HTTP, então não existe status. O navegador mostra uma página de erro própria (`ERR_CONNECTION_REFUSED`), a aba Network mostra `(failed)`, e no código a Promise do `fetch` é rejeitada com `TypeError: Failed to fetch`. Esse é exatamente o caso em que o `fetch` lança erro, ao contrário de um 404, que é uma resposta válida.
2. A `.venv` fica fora do git por três motivos. Ela é gerada a partir do `requirements.txt`, então guardar as duas coisas duplica informação. Ela é pesada, com milhares de arquivos e centenas de megabytes. E, principalmente, ela não funciona em outra máquina, porque contém executáveis do Windows (`.venv\Scripts\python.exe`) e caminhos absolutos do seu computador gravados no `pyvenv.cfg`, que não existem na máquina de um colega, e menos ainda num Linux ou Mac. Para rodar, o colega recria a pasta com `python -m venv .venv` e a preenche com `pip install -r requirements.txt`. Um detalhe: o `>=` no `requirements.txt` permite que o colega instale versões mais novas que as suas, e é esse problema que o `package-lock.json` resolve no frontend, assunto da lição 01.
3. O motivo é confiança, e não exatamente uma regra que toda camada deve repetir. O frontend roda na máquina do usuário e fica sob o controle dele, então o botão desabilitado pode ser contornado: dá para remover o `disabled` pelo F12, mandar o pedido pelo terminal com `curl`, ou pela página `/docs`, como você mesmo fez no segundo passo da verificação, onde o 422 veio de um pedido que não passou por nenhum botão. Por isso a validação do frontend serve à experiência, dando um aviso rápido e evitando um pedido inútil, enquanto a validação do backend serve à integridade, porque é ela que garante que nenhum projeto sem título seja salvo. A regra prática é que quem guarda os dados nunca confia no que chega.
