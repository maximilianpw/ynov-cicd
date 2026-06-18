#!/bin/sh
set -eu

root_password="${MYSQL_ROOT_PASSWORD:-passwd}"
database="${MYSQL_DATABASE:-ynov-cicd}"
admin_email="${ADMIN_EMAIL:-loise.fenoll@ynov.com}"
react_port="${REACT_PORT:-3000}"

cleanup() {
  docker compose down -v
}

trap cleanup EXIT

docker compose down -v
docker compose up -d --build
sh scripts/wait-for-compose.sh

curl -fsS http://127.0.0.1:8000/health
curl -fsS http://127.0.0.1:8000/users
curl -fsSL "http://127.0.0.1:${react_port}/ynov-cicd/" >/dev/null
curl -fsS http://127.0.0.1:8081/

docker compose exec -T db \
  mysql -uroot -p"${root_password}" "${database}" \
  -e "SELECT email FROM admin WHERE email = '${admin_email}';"

docker compose down backend

if docker compose ps -q backend | grep -q .; then
  echo "Backend container still exists after docker compose down backend" >&2
  exit 1
fi

if curl -fsS http://127.0.0.1:8000/health >/dev/null 2>&1; then
  echo "Backend health endpoint should be unavailable after docker compose down backend" >&2
  exit 1
fi

curl -fsSL "http://127.0.0.1:${react_port}/ynov-cicd/" >/dev/null

docker compose up -d backend
COMPOSE_SERVICES=backend sh scripts/wait-for-compose.sh
curl -fsS http://127.0.0.1:8000/health
