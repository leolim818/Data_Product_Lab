#!/usr/bin/env bash
set -e

API_KEY="${API_KEY:-local-development-key}"
PROPERTY_ID="${PROPERTY_ID:-P1001}"

echo "=== Rebuilding lab ==="

docker compose down --remove-orphans

docker compose build --no-cache

docker compose up -d

echo
echo "=== Waiting for Kong Gateway ==="

until curl -s http://localhost:8000 >/dev/null 2>&1; do
  echo "Kong not ready yet..."
  sleep 3
done

echo
echo "=== Kong is ready ==="

echo
echo "=== Testing GraphQL through Kong ==="

curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" \
  --data "{
    \"query\": \"query { property(id: \\\"${PROPERTY_ID}\\\") { id name type occupancyRate revenue leases { id tenantName monthlyRent status } financials { annualRevenue operatingCost netOperatingIncome } } }\"
  }"

echo
echo
echo "=== Test completed ==="