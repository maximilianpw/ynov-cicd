# Ynov CICD

Application d'inscription React + FastAPI + MySQL pour le deuxieme projet
individuel CI/CD.

## Lancer l'architecture Docker

```bash
docker compose up --build
```

Services locaux :

- React : `http://localhost:3000/ynov-cicd/`
- API FastAPI (`backend`) : `http://localhost:8000`
- Adminer : `http://localhost:8081`
- MySQL : `localhost:3306`

Si le port 3000 est deja utilise, lancez Docker avec `REACT_PORT=3100` et
utilisez `http://localhost:3100/ynov-cicd/`.

Au premier demarrage MySQL, les migrations creent la base, les tables
`utilisateur` et `admin`, puis inserent l'administrateur depuis les variables
d'environnement.

Identifiants admin par defaut :

- email : `loise.fenoll@ynov.com`
- mot de passe : `PvdrTAzTeR247sDnAZBr`

## Variables d'environnement

Docker local fournit des valeurs par defaut, mais elles peuvent etre surchargees :

```bash
MYSQL_ROOT_PASSWORD=passwd
MYSQL_DATABASE=ynov-cicd
MYSQL_USER=root
MYSQL_HOST=db
MYSQL_PORT=3306
ADMIN_EMAIL=loise.fenoll@ynov.com
ADMIN_PASSWORD=PvdrTAzTeR247sDnAZBr
VITE_API_URL=http://localhost:8000
CORS_ORIGINS=*
REACT_PORT=3000
```

Production :

- Cote Vercel backend avec Aiven MySQL :
  - `MYSQL_HOST=mysql-298328f0-proton-1e70.j.aivencloud.com`
  - `MYSQL_PORT=22462`
  - `MYSQL_DATABASE=defaultdb`
  - `MYSQL_USER=avnadmin`
  - `MYSQL_PASSWORD` doit contenir le mot de passe Aiven.
- Cote Vercel backend : `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS`.
- Cote GitHub Actions : `VITE_API_URL` doit pointer vers l'API Vercel.
- Deploiement Vercel : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Optionnel : `CODECOV_TOKEN`.

La base MySQL de production doit etre creee sur Aiven ou Alwaysdata, avec le
schema equivalent aux migrations de `migrations/`.

## Fonctionnalites

- Le formulaire React valide nom, prenom, email, date de naissance, ville et
  code postal.
- Une inscription valide est sauvegardee en base via `POST /users`.
- La liste publique affiche seulement les informations reduites :
  prenom, nom et email.
- Un compte admin peut afficher les informations privees d'un inscrit :
  date de naissance, ville et code postal.
- Un compte admin peut supprimer un inscrit.

## API

- `GET /health` : verification API + base.
- `GET /users` : liste publique des inscrits.
- `POST /users` : creation d'un inscrit.
- `GET /admin/users/{id}` : details prives, protege par Basic Auth admin.
- `DELETE /admin/users/{id}` : suppression, protege par Basic Auth admin.

## Tests

Frontend unitaires et integration :

```bash
pnpm run test
pnpm run coverage
```

Backend FastAPI :

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt -r requirements-dev.txt
python -m pytest server
```

Infrastructure Docker :

```bash
pnpm run test:infra
```

End-to-end Cypress contre l'architecture Docker :

```bash
docker compose up -d --build
sh scripts/wait-for-compose.sh
pnpm run cy:run
docker compose down -v
```

Test Cypress du mode backend hors ligne :

```bash
docker compose up -d --build
sh scripts/wait-for-compose.sh
pnpm run cy:offline
docker compose down -v
```

Le mode hors ligne Cypress est active par `CYPRESS_OFFLINE=true` dans le script
`cy:offline`; le test mocke les routes API au lieu de couper le backend.

Avec un port React alternatif :

```bash
REACT_PORT=3100 docker compose up -d --build
sh scripts/wait-for-compose.sh
CYPRESS_BASE_URL=http://localhost:3100 pnpm run cy:run
docker compose down -v
```

## CI/CD

Le workflow GitHub Actions :

- construit le front ;
- lance les tests unitaires et d'integration frontend avec couverture ;
- lance les tests backend FastAPI ;
- demarre l'environnement Docker et lance les tests d'infrastructure ;
- lance Cypress contre Docker ;
- deploie le front vers GitHub Pages ;
- deploie le backend vers Vercel.
