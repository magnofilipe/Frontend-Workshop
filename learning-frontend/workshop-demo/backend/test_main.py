import pytest
from fastapi.testclient import TestClient

from main import FRONTEND_ORIGIN, create_app

SEED = (
    {"title": "Primeiro", "description": "Com descrição"},
    {"title": "Segundo", "description": None},
)


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app(SEED))


def titles(client: TestClient) -> list[str]:
    return [project["title"] for project in client.get("/projects").json()]


def test_list_returns_seed_projects_in_order(client):
    response = client.get("/projects")

    assert response.status_code == 200
    body = response.json()
    assert [p["title"] for p in body] == ["Primeiro", "Segundo"]
    assert [p["description"] for p in body] == ["Com descrição", None]
    assert all(isinstance(p["id"], str) and p["id"] for p in body)


def test_create_returns_201_with_the_new_project(client):
    response = client.post("/projects", json={"title": "Novo", "description": "Desc"})

    assert response.status_code == 201
    created = response.json()
    assert created["title"] == "Novo"
    assert created["description"] == "Desc"
    assert created["id"]


def test_created_project_appears_at_the_end_of_the_list(client):
    client.post("/projects", json={"title": "Novo"})

    assert titles(client) == ["Primeiro", "Segundo", "Novo"]


def test_create_without_description_stores_null(client):
    response = client.post("/projects", json={"title": "Sem descrição"})

    assert response.json()["description"] is None


@pytest.mark.parametrize("description", ["", "   "])
def test_create_with_blank_description_stores_null(client, description):
    response = client.post("/projects", json={"title": "Novo", "description": description})

    assert response.json()["description"] is None


def test_create_trims_title(client):
    response = client.post("/projects", json={"title": "  Novo  "})

    assert response.json()["title"] == "Novo"


@pytest.mark.parametrize("body", [{"title": ""}, {"title": "   "}, {}, {"description": "Só descrição"}])
def test_create_without_valid_title_returns_422(client, body):
    response = client.post("/projects", json=body)

    assert response.status_code == 422
    assert titles(client) == ["Primeiro", "Segundo"]


def test_delete_returns_204_without_body_and_removes_project(client):
    first_id = client.get("/projects").json()[0]["id"]

    response = client.delete(f"/projects/{first_id}")

    assert response.status_code == 204
    assert response.content == b""
    assert titles(client) == ["Segundo"]


def test_delete_unknown_project_returns_404(client):
    response = client.delete("/projects/nao-existe")

    assert response.status_code == 404
    assert titles(client) == ["Primeiro", "Segundo"]


def test_delete_same_project_twice_returns_404_the_second_time(client):
    first_id = client.get("/projects").json()[0]["id"]
    client.delete(f"/projects/{first_id}")

    assert client.delete(f"/projects/{first_id}").status_code == 404


def test_each_app_starts_with_its_own_data():
    first_app = TestClient(create_app(SEED))
    second_app = TestClient(create_app(SEED))
    first_app.post("/projects", json={"title": "Só no primeiro"})

    assert titles(second_app) == ["Primeiro", "Segundo"]


def test_cors_allows_the_vite_origin(client):
    response = client.options(
        "/projects",
        headers={
            "Origin": FRONTEND_ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == FRONTEND_ORIGIN


def test_cors_does_not_allow_other_origins(client):
    response = client.get("/projects", headers={"Origin": "http://localhost:3000"})

    assert "access-control-allow-origin" not in response.headers
