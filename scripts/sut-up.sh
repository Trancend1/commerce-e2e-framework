#!/usr/bin/env bash
# Boots the pinned Toolshop SUT, waits until reachable, then migrates + seeds the DB.
# Used locally (Git Bash) and by CI. See docs/ENVIRONMENT.md.
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose up -d --quiet-pull

wait_for() {
  local name=$1 url=$2 tries=${3:-60}
  for ((i = 1; i <= tries; i++)); do
    if curl -sf -o /dev/null "$url"; then
      echo "$name is up ($url)"
      return 0
    fi
    sleep 3
  done
  echo "ERROR: $name not reachable at $url after $((tries * 3))s" >&2
  docker compose logs --tail 50 >&2
  return 1
}

wait_for "Toolshop API" "http://localhost:8091/status"
docker compose exec -T laravel-api php artisan migrate:fresh --seed --force
# first `ng serve` build inside the UI container can take a while
wait_for "Toolshop UI" "http://localhost:4200" 100

echo "SUT ready — UI http://localhost:4200, API http://localhost:8091"
