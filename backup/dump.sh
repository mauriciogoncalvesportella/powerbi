#!/bin/bash

read -p "schema: " schema

if [ -z "$DO_ADMIN_PG_PASSWORD" ]; then
  read -s -p "doadmin password: " password
else
  password=$DO_ADMIN_PG_PASSWORD
fi

echo

PGPASSWORD="$password" pg_dump \
  -h db-postgresql-sfo2-31502-do-user-7196057-0.b.db.ondigitalocean.com \
  -p 25060 \
  -U doadmin \
  -d bi \
  -n "$schema" \
  --no-owner \
  -F c \
  -v \
  -f $schema.backup

unset PGPASSWORD
