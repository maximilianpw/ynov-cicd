from contextlib import contextmanager
from datetime import date, datetime
import os
from typing import Annotated, Any, Iterator

import mysql.connector
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from mysql.connector import IntegrityError
from pydantic import BaseModel


app = FastAPI(title="Ynov CICD Registration API")
security = HTTPBasic()

cors_origins = os.getenv("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins.split(",")],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegistrationPayload(BaseModel):
    name: str
    prenom: str
    email: str
    dateNaissance: date
    ville: str
    codePostal: str


class UserSummary(BaseModel):
    id: int
    name: str
    prenom: str
    email: str


class PrivateUser(UserSummary):
    dateNaissance: date
    ville: str
    codePostal: str
    createdAt: datetime
    updatedAt: datetime


def mysql_config() -> dict[str, Any]:
    return {
        "database": os.getenv("MYSQL_DATABASE", "ynov-cicd"),
        "user": os.getenv("MYSQL_USER", "root"),
        "password": os.getenv(
            "MYSQL_PASSWORD", os.getenv("MYSQL_ROOT_PASSWORD", "passwd")
        ),
        "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
        "port": int(os.getenv("MYSQL_PORT", "3306")),
    }


def get_connection():
    return mysql.connector.connect(**mysql_config())


@contextmanager
def cursor_for(connection, *, dictionary: bool = True) -> Iterator[Any]:
    cursor = connection.cursor(dictionary=dictionary)
    try:
        yield cursor
    finally:
        cursor.close()


def database_connection():
    connection = get_connection()
    try:
        yield connection
    finally:
        connection.close()


def row_to_summary(row: dict[str, Any]) -> UserSummary:
    return UserSummary(
        id=row["id"],
        name=row["name"],
        prenom=row["prenom"],
        email=row["email"],
    )


def row_to_private_user(row: dict[str, Any]) -> PrivateUser:
    return PrivateUser(
        id=row["id"],
        name=row["name"],
        prenom=row["prenom"],
        email=row["email"],
        dateNaissance=row["date_naissance"],
        ville=row["ville"],
        codePostal=row["code_postal"],
        createdAt=row["created_at"],
        updatedAt=row["updated_at"],
    )


def require_admin(
    credentials: Annotated[HTTPBasicCredentials, Depends(security)],
    connection=Depends(database_connection),
) -> None:
    with cursor_for(connection) as cursor:
        cursor.execute(
            "SELECT id FROM admin WHERE email = %s AND password = %s LIMIT 1",
            (credentials.username, credentials.password),
        )
        admin = cursor.fetchone()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Basic"},
        )


@app.get("/health")
def health(connection=Depends(database_connection)):
    with cursor_for(connection) as cursor:
        cursor.execute("SELECT 1 AS ok")
        cursor.fetchone()

    return {"status": "ok"}


@app.get("/users", response_model=list[UserSummary])
def get_users(connection=Depends(database_connection)):
    with cursor_for(connection) as cursor:
        cursor.execute(
            """
            SELECT id, name, prenom, email
            FROM utilisateur
            ORDER BY id
            """
        )
        return [row_to_summary(row) for row in cursor.fetchall()]


@app.post("/users", response_model=UserSummary, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: RegistrationPayload,
    connection=Depends(database_connection),
):
    with cursor_for(connection, dictionary=False) as cursor:
        try:
            cursor.execute(
                """
                INSERT INTO utilisateur
                    (name, prenom, email, date_naissance, ville, code_postal)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    payload.name.strip(),
                    payload.prenom.strip(),
                    payload.email.strip(),
                    payload.dateNaissance,
                    payload.ville.strip(),
                    payload.codePostal.strip(),
                ),
            )
        except IntegrityError as error:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            ) from error

        connection.commit()
        user_id = cursor.lastrowid

    return UserSummary(
        id=user_id,
        name=payload.name.strip(),
        prenom=payload.prenom.strip(),
        email=payload.email.strip(),
    )


@app.get(
    "/admin/users/{user_id}",
    response_model=PrivateUser,
    dependencies=[Depends(require_admin)],
)
def get_private_user(user_id: int, connection=Depends(database_connection)):
    with cursor_for(connection) as cursor:
        cursor.execute(
            """
            SELECT
                id,
                name,
                prenom,
                email,
                date_naissance,
                ville,
                code_postal,
                created_at,
                updated_at
            FROM utilisateur
            WHERE id = %s
            """,
            (user_id,),
        )
        row = cursor.fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return row_to_private_user(row)


@app.delete(
    "/admin/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_user(user_id: int, connection=Depends(database_connection)):
    with cursor_for(connection, dictionary=False) as cursor:
        cursor.execute("DELETE FROM utilisateur WHERE id = %s", (user_id,))
        deleted_count = cursor.rowcount
        connection.commit()

    if deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
