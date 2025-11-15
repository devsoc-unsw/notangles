#!/usr/bin/env bash
set -euo pipefail

# Ensure Homebrew binaries are available when launched from GUI apps
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# Configuration - adjust if needed
ROOT="$HOME/notangles-server-rewrite"
AUTO_DIR="$ROOT/auto_server"
BACKEND_DIR="$ROOT/server"
CLIENT_DIR="$ROOT/client"
POSTGRES_DATA="$HOME/notangles-db"
AUTOTABLE_CONTAINER="autotimetable"

# Ports (change here if they ever move)
AUTOTABLE_PORT=${AUTOTABLE_PORT:-50051}
POSTGRES_PORT=${POSTGRES_PORT:-5443}
BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

WAIT_TIMEOUT=${WAIT_TIMEOUT:-120}
SLEEP_INTERVAL=${SLEEP_INTERVAL:-2}

# Helper: wait for TCP port
wait_for_port() {
  local host=${1:-127.0.0.1}
  local port=$2
  local timeout=${3:-$WAIT_TIMEOUT}
  local elapsed=0
  echo "Waiting for service on ${host}:${port}..."
  while ! nc -z "$host" "$port" 2>/dev/null; do
    elapsed=$((elapsed + SLEEP_INTERVAL))
    if [ "$elapsed" -ge "$timeout" ]; then
      echo "ERROR: Service did not start on port $port within ${timeout}s timeout." >&2
      return 1
    fi
    sleep "$SLEEP_INTERVAL"
  done
  echo "Service ready on ${host}:${port}"
  return 0
}

# Helper: check if postgres is ready (can accept connections)
wait_for_postgres() {
  local timeout=${1:-$WAIT_TIMEOUT}
  local elapsed=0
  echo "Waiting for PostgreSQL to be ready..."
  while ! pg_isready -h 127.0.0.1 -p "$POSTGRES_PORT" -q 2>/dev/null; do
    elapsed=$((elapsed + SLEEP_INTERVAL))
    if [ "$elapsed" -ge "$timeout" ]; then
      echo "ERROR: PostgreSQL did not become ready within ${timeout}s timeout." >&2
      return 1
    fi
    sleep "$SLEEP_INTERVAL"
  done
  echo "PostgreSQL is ready"
  return 0
}

# Usage function
usage() {
  cat <<EOF
Usage: $0 <command>

Commands:
  auto      - Start autotimetabler Docker container
  postgres  - Start PostgreSQL database
  prisma    - Start Prisma Studio (requires postgres to be running)
  backend   - Start backend server (requires postgres to be running)
  frontend  - Start frontend dev server (requires backend to be running)
  all       - Start all services in correct order (for testing)

Example:
  $0 auto
  $0 postgres
  $0 backend
EOF
  exit 1
}

# Command handlers
start_auto() {
  echo "Starting Autotimetabler..."
  cd "$AUTO_DIR"
  
  # Start colima if not running
  if ! colima status &>/dev/null; then
    echo "Starting colima..."
    colima start
  fi
  
  # Build Docker image if needed
  if ! docker images | grep notangles-auto; then
    echo "Building Docker image..."
    docker build -t notangles-auto .
  fi
  
  # Start or create container
  if [ -z "$(docker ps -q -f name=$AUTOTABLE_CONTAINER)" ]; then
    if docker ps -a | grep "$AUTOTABLE_CONTAINER"; then
      echo "Starting existing container..."
      docker start "$AUTOTABLE_CONTAINER"
    else
      echo "Creating new container..."
      docker run -d -p "$AUTOTABLE_PORT:$AUTOTABLE_PORT" --name "$AUTOTABLE_CONTAINER" notangles-auto
    fi
  else
    echo "Container $AUTOTABLE_CONTAINER is already running"
  fi
  
  # Follow logs
  echo "Following autotimetabler logs (Ctrl+C to exit)..."
  docker logs -f "$AUTOTABLE_CONTAINER"
}

start_postgres() {
  echo "Starting PostgreSQL..."
  
  # Check if postgres data directory exists
  if [ ! -d "$POSTGRES_DATA" ]; then
    echo "PostgreSQL data directory not found at $POSTGRES_DATA"
    echo "Initializing new database cluster..."
    initdb -D "$POSTGRES_DATA"
  fi
  
  # Start postgres
  echo "Running PostgreSQL on port $POSTGRES_PORT..."
  postgres -D "$POSTGRES_DATA" -p "$POSTGRES_PORT"
}

start_prisma() {
  echo "Starting Prisma Studio..."
  
  # Check if postgres is running
  if ! wait_for_postgres 10; then
    echo "ERROR: PostgreSQL must be running before starting Prisma Studio" >&2
    echo "Please start PostgreSQL first with: $0 postgres" >&2
    echo "Then run $0 prisma again." >&2
    exit 1
  fi
  
  cd "$BACKEND_DIR"
  pnpx prisma studio --browser=none
}

start_backend() {
  echo "Starting Backend..."
  
  # Check if postgres is running
  if ! wait_for_postgres 10; then
    echo "ERROR: PostgreSQL must be running before starting backend" >&2
    echo "Please start PostgreSQL first with: $0 postgres" >&2
    echo "Then run $0 backend again." >&2
    exit 1
  fi
  
  cd "$BACKEND_DIR"
  
  echo "Installing dependencies..."
  pnpm i
  
  echo "Generating GraphQL types..."
  pnpm graphql || true
  
  echo "Generating Prisma client..."
  pnpm prisma generate || true
  
  echo "Running database migrations..."
  pnpm prisma migrate dev --name dev || true
  
  echo "Starting backend server..."
  pnpm run start:dev
}

start_frontend() {
  echo "Starting Frontend..."
  
  # Check if backend is running
  if ! wait_for_port 127.0.0.1 "$BACKEND_PORT" 20; then
    echo "ERROR: Backend must be running before starting frontend" >&2
    echo "Please start backend first with: $0 backend" >&2
    exit 1
  fi
  
  cd "$CLIENT_DIR"
  
  echo "Installing dependencies..."
  pnpm i
  
  echo "Starting frontend dev server..."
  pnpm run start
}


# Main command dispatcher
if [ $# -eq 0 ]; then
  usage
fi

case "$1" in
  auto)
    start_auto
    ;;
  postgres)
    start_postgres
    ;;
  prisma)
    start_prisma
    ;;
  backend)
    start_backend
    ;;
  frontend)
    start_frontend
    ;;
  *)
    echo "Unknown command: $1" >&2
    usage
    ;;
esac