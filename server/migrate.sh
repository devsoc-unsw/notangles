#!/bin/sh

set -e

cd /app/prisma

# Check if there are any migrations
if [ -z "$(ls -A migrations)" ]; then
  echo "No existing migrations found. Creating initial migration..."
else
  echo "Existing migrations found. Deleting and reapplying..."
  rm -rf migrations/*
fi

npx prisma migrate dev --name init
npx prisma generate
