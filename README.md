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

Identifiants admin de developpement utilises par les scripts de test :

- email : `admin@example.test`
- mot de passe : `local-dev-admin-password`

## Variables d'environnement

Docker local attend ces variables. Les valeurs ci-dessous sont uniquement des
exemples de developpement :

```bash
MYSQL_ROOT_PASSWORD=local-dev-root-password
MYSQL_DATABASE=ynov-cicd
MYSQL_USER=root
MYSQL_HOST=db
MYSQL_PORT=3306
ADMIN_EMAIL=admin@example.test
ADMIN_PASSWORD=local-dev-admin-password
VITE_API_URL=http://localhost:8000
CORS_ORIGINS=*
REACT_PORT=3000
```

Production :

- Le deploiement final AWS est documente dans `ARCHITECTURE.md`.
- Le workflow manuel `.github/workflows/deploy.yml` construit les images,
  les pousse sur le registry prive, provisionne l'EC2 applicative avec
  Terraform, puis lance Ansible.
- Les secrets requis sont listes dans `.env.sample`.
- Le frontend de production est construit avec `VITE_API_URL=/api`; Nginx
  route ensuite `/api/*` vers le backend Docker.
- Optionnel : `CODECOV_TOKEN` pour l'envoi de couverture.

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
- lance Cypress contre Docker.

Le deploiement final du projet se lance manuellement avec
`.github/workflows/deploy.yml`. Il construit et pousse les images Docker sur le
registry prive, cree l'infrastructure AWS applicative, execute Ansible, puis
valide le front et le backend avec `curl`.
