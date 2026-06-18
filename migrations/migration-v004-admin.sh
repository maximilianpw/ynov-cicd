#!/bin/sh
set -eu

admin_email="${ADMIN_EMAIL:-loise.fenoll@ynov.com}"
admin_password="${ADMIN_PASSWORD:-PvdrTAzTeR247sDnAZBr}"
database="${MYSQL_DATABASE:-ynov-cicd}"
escaped_admin_email="$(printf "%s" "${admin_email}" | sed "s/'/''/g")"
escaped_admin_password="$(printf "%s" "${admin_password}" | sed "s/'/''/g")"

mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" "${database}" <<EOSQL
INSERT INTO admin (email, password)
VALUES ('${escaped_admin_email}', '${escaped_admin_password}')
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  updated_at = CURRENT_TIMESTAMP;
EOSQL
