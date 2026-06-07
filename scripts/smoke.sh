#!/usr/bin/env bash
# Smoke test against a running instance. Requires the integration to be
# connected to the "Delacosta · CRM" page in Notion.
#
#   BASE=http://localhost:3000 bash scripts/smoke.sh
set -euo pipefail
BASE="${BASE:-http://localhost:3000}"
H_JSON=(-H "Content-Type: application/json")
[ -n "${API_KEY:-}" ] && H_JSON+=(-H "x-api-key: ${API_KEY}")

echo "== health =="
curl -fsS "$BASE/health"; echo

echo "== categorías =="
curl -fsS "$BASE/api/categories" | head -c 600; echo

echo "== catálogo (productos activos) =="
curl -fsS "$BASE/api/products/catalogo" | head -c 600; echo

echo "== crear cliente =="
curl -fsS -X POST "${H_JSON[@]}" "$BASE/api/customers" \
  -d '{"nombre":"Cliente Smoke","email":"smoke@delacosta.cl","origen":"Web"}' | head -c 600; echo

echo "== buscar cliente por email =="
curl -fsS "$BASE/api/customers/find?email=smoke@delacosta.cl" | head -c 600; echo

echo "Listo. Para probar /api/checkout necesitas un productId real del catálogo."
