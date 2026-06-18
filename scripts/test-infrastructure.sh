#!/bin/sh
set -eu

root_password="${MYSQL_ROOT_PASSWORD:-passwd}"
database="${MYSQL_DATABASE:-ynov-cicd}"
admin_email="${ADMIN_EMAIL:-admin@example.com}"
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
curl -fsS "http://127.0.0.1:${react_port}/ynov-cicd/"
curl -fsS http://127.0.0.1:8081/

docker compose exec -T db \
  mysql -uroot -p"${root_password}" "${database}" \
  -e "SELECT email FROM admin WHERE email = '${admin_email}';"
