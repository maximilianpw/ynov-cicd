from contextlib import contextmanager
from datetime import date, datetime

from fastapi.testclient import TestClient
from mysql.connector import IntegrityError

from server.main import app, database_connection


class FakeCursor:
    def __init__(self, connection, *, dictionary=True):
        self.connection = connection
        self.dictionary = dictionary
        self.lastrowid = connection.lastrowid
        self.rowcount = 0
        self.result = []

    def execute(self, query, params=None):
        self.connection.executed.append((query, params, self.dictionary))

        if self.connection.raise_integrity:
            raise IntegrityError("duplicate")

        self.result = (
            self.connection.results.pop(0) if self.connection.results else []
        )
        self.rowcount = (
            self.connection.rowcounts.pop(0)
            if self.connection.rowcounts
            else len(self.result)
        )

    def fetchone(self):
        return self.result[0] if self.result else None

    def fetchall(self):
        return self.result

    def close(self):
        self.connection.closed_cursors += 1


class FakeConnection:
    def __init__(
        self,
        *,
        results=None,
        rowcounts=None,
        lastrowid=1,
        raise_integrity=False,
    ):
        self.results = results or []
        self.rowcounts = rowcounts or []
        self.lastrowid = lastrowid
        self.raise_integrity = raise_integrity
        self.executed = []
        self.closed_cursors = 0
        self.commits = 0
        self.closed = False

    def cursor(self, *, dictionary=True):
        return FakeCursor(self, dictionary=dictionary)

    def commit(self):
        self.commits += 1

    def close(self):
        self.closed = True


@contextmanager
def client_with(connection):
    app.dependency_overrides[database_connection] = lambda: connection

    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides.clear()


def private_row():
    return {
        "id": 4,
        "name": "Pinder-White",
        "prenom": "Max",
        "email": "max.pinder-white@example.com",
        "date_naissance": date(1998, 4, 12),
        "ville": "Lyon",
        "code_postal": "69001",
        "created_at": datetime(2026, 6, 18, 8, 0, 0),
        "updated_at": datetime(2026, 6, 18, 8, 0, 0),
    }


def test_health_checks_database():
    connection = FakeConnection(results=[[{"ok": 1}]])

    with client_with(connection) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert connection.closed_cursors == 1


def test_get_users_returns_reduced_users():
    connection = FakeConnection(
        results=[
            [
                {
                    "id": 1,
                    "name": "Pinder-White",
                    "prenom": "Max",
                    "email": "max.pinder-white@example.com",
                }
            ]
        ]
    )

    with client_with(connection) as client:
        response = client.get("/users")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 1,
            "name": "Pinder-White",
            "prenom": "Max",
            "email": "max.pinder-white@example.com",
        }
    ]


def test_create_user_inserts_registration():
    connection = FakeConnection(lastrowid=7)

    with client_with(connection) as client:
        response = client.post(
            "/users",
            json={
                "name": " Pinder-White ",
                "prenom": " Max ",
                "email": " max.pinder-white@example.com ",
                "dateNaissance": "1998-04-12",
                "ville": " Lyon ",
                "codePostal": " 69001 ",
            },
        )

    assert response.status_code == 201
    assert response.json() == {
        "id": 7,
        "name": "Pinder-White",
        "prenom": "Max",
        "email": "max.pinder-white@example.com",
    }
    assert "INSERT INTO utilisateur" in connection.executed[0][0]
    assert connection.executed[0][1] == (
        "Pinder-White",
        "Max",
        "max.pinder-white@example.com",
        date(1998, 4, 12),
        "Lyon",
        "69001",
    )
    assert connection.commits == 1


def test_create_user_returns_conflict_for_duplicate_email():
    connection = FakeConnection(raise_integrity=True)

    with client_with(connection) as client:
        response = client.post(
            "/users",
            json={
                "name": "Pinder-White",
                "prenom": "Max",
                "email": "max.pinder-white@example.com",
                "dateNaissance": "1998-04-12",
                "ville": "Lyon",
                "codePostal": "69001",
            },
        )

    assert response.status_code == 409
    assert response.json()["detail"] == "Email already registered"
    assert connection.commits == 0


def test_private_user_requires_admin_credentials():
    connection = FakeConnection(results=[[], [private_row()]])

    with client_with(connection) as client:
        response = client.get(
            "/admin/users/4",
            auth=("admin@example.test", "wrong-password"),
        )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid admin credentials"


def test_private_user_returns_full_details_for_admin():
    connection = FakeConnection(results=[[{"id": 1}], [private_row()]])

    with client_with(connection) as client:
        response = client.get(
            "/admin/users/4",
            auth=("admin@example.test", "local-dev-admin-password"),
        )

    assert response.status_code == 200
    assert response.json() == {
        "id": 4,
        "name": "Pinder-White",
        "prenom": "Max",
        "email": "max.pinder-white@example.com",
        "dateNaissance": "1998-04-12",
        "ville": "Lyon",
        "codePostal": "69001",
        "createdAt": "2026-06-18T08:00:00",
        "updatedAt": "2026-06-18T08:00:00",
    }


def test_private_user_returns_not_found_for_missing_user():
    connection = FakeConnection(results=[[{"id": 1}], []])

    with client_with(connection) as client:
        response = client.get(
            "/admin/users/404",
            auth=("admin@example.test", "local-dev-admin-password"),
        )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_delete_user_removes_registration_for_admin():
    connection = FakeConnection(results=[[{"id": 1}], []], rowcounts=[0, 1])

    with client_with(connection) as client:
        response = client.delete(
            "/admin/users/4",
            auth=("admin@example.test", "local-dev-admin-password"),
        )

    assert response.status_code == 204
    assert connection.commits == 1
    assert "DELETE FROM utilisateur" in connection.executed[1][0]
    assert connection.executed[1][1] == (4,)


def test_delete_user_returns_not_found_for_missing_registration():
    connection = FakeConnection(results=[[{"id": 1}], []], rowcounts=[0, 0])

    with client_with(connection) as client:
        response = client.delete(
            "/admin/users/404",
            auth=("admin@example.test", "local-dev-admin-password"),
        )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"
