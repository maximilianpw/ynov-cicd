#!/bin/sh
set -eu

services="${COMPOSE_SERVICES:-db adminer backend react}"
timeout_seconds="${COMPOSE_HEALTH_TIMEOUT:-180}"
started_at="$(date +%s)"

for service in ${services}; do
  container_id="$(docker compose ps -q "${service}")"

  if [ -z "${container_id}" ]; then
    echo "Container for service ${service} was not created" >&2
    docker compose ps
    exit 1
  fi

  echo "Waiting for ${service} to become healthy..."

  while true; do
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${container_id}")"

    if [ "${status}" = "healthy" ]; then
      echo "${service} is healthy"
      break
    fi

    now="$(date +%s)"
    elapsed="$((now - started_at))"

    if [ "${elapsed}" -ge "${timeout_seconds}" ]; then
      echo "Timed out waiting for ${service}. Last status: ${status}" >&2
      docker compose ps
      docker logs "${container_id}" || true
      exit 1
    fi

    sleep 5
  done
done
