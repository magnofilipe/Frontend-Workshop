# Backend da demo

API de projetos em FastAPI, com os dados guardados em memória. Ao reiniciar o servidor, a lista volta aos três projetos iniciais.

## Rodar

No PowerShell, dentro desta pasta:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

A documentação interativa fica em http://localhost:8000/docs.

## Testar

```powershell
pytest -v
```

## Contrato

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/projects` | nenhum | `200` com a lista de projetos |
| POST | `/projects` | `{ "title": string, "description": string \| null }` | `201` com o projeto criado; `422` se o título estiver vazio |
| DELETE | `/projects/{id}` | nenhum | `204` sem corpo; `404` se o projeto não existir |

Formato do projeto: `{ "id": string, "title": string, "description": string | null }`.

O título e a descrição chegam sem espaços nas pontas, e uma descrição vazia é guardada como `null`. O CORS só libera `http://localhost:5173`, que é a porta padrão do Vite.
