from typing import Annotated
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, StringConstraints, field_validator

FRONTEND_ORIGIN = "http://localhost:5173"

SEED_PROJECTS = (
    {
        "title": "Observatório do Mercado de Trabalho",
        "description": "Indicadores de emprego e renda por região.",
    },
    {
        "title": "Avaliação do Ensino Médio",
        "description": None,
    },
    {
        "title": "Saúde Pública em Números",
        "description": "Dados do SUS consolidados por município.",
    },
)

Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class ProjectInput(BaseModel):
    title: Title
    description: str | None = None

    @field_validator("description")
    @classmethod
    def blank_description_becomes_none(cls, value: str | None) -> str | None:
        """Uma descrição vazia ou só com espaços é tratada como ausente."""
        if value is None:
            return None
        return value.strip() or None


class Project(BaseModel):
    id: str
    title: str
    description: str | None


def new_project(data: ProjectInput) -> Project:
    return Project(id=str(uuid4()), **data.model_dump())


def create_app(seed: tuple[dict, ...] = SEED_PROJECTS) -> FastAPI:
    """Cria a API com os projetos guardados em memória; reiniciar o servidor volta aos dados iniciais."""
    projects: dict[str, Project] = {
        project.id: project
        for project in (new_project(ProjectInput(**data)) for data in seed)
    }

    app = FastAPI(title="Projetos (demo do workshop)")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[FRONTEND_ORIGIN],
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["Content-Type"],
    )

    @app.get("/projects")
    def list_projects() -> list[Project]:
        return list(projects.values())

    @app.post("/projects", status_code=status.HTTP_201_CREATED)
    def create_project(data: ProjectInput) -> Project:
        project = new_project(data)
        projects[project.id] = project
        return project

    @app.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_project(project_id: str) -> Response:
        if projects.pop(project_id, None) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return app


app = create_app()
