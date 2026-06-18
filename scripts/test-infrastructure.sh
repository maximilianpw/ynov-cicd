#!/bin/sh
set -eu

export MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-local-dev-root-password}"
export MYSQL_DATABASE="${MYSQL_DATABASE:-ynov-cicd}"
export ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.test}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-local-dev-admin-password}"
export REACT_PORT="${REACT_PORT:-3100}"

root_password="${MYSQL_ROOT_PASSWORD}"
database="${MYSQL_DATABASE}"
admin_email="${ADMIN_EMAIL}"
react_port="${REACT_PORT}"

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
