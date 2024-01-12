#!/bin/bash

read -p "schema: " schema
password="admin"
echo

exist_schema=$(PGPASSWORD="$password" psql -h localhost -p 5432 -U admin -d bi -tAc "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = '$schema';")

if [ "$exist_schema" -gt 0 ]; then
  PGPASSWORD="$password" psql -h localhost -p 5432 -U admin -d bi -c "DROP SCHEMA $schema CASCADE;"
fi

PGPASSWORD="$password" psql -h localhost -p 5432 -U admin -d bi -c "CREATE SCHEMA $schema;"

PGPASSWORD="$password" pg_restore \
  -h localhost \
  -p 5432 \
  -U admin \
  -d bi \
  -n "$schema" \
  --no-owner \
  -v \
  -c \
  $schema.backup

unset PGPASSWORD
