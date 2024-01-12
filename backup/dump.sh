#!/bin/bash

read -p "schema: " schema
read -s -p "doadmin password: " password
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
