# Sample Data Products: Apollo GraphQL + Kong + PostgreSQL

This local proof of concept contains two independent Data Products:

1. Property Performance
2. Leasing Performance

Each product has its own PostgreSQL database, Apollo GraphQL service, metadata file, data quality rules, and Kong route.

## Architecture

Client -> Kong Gateway -> Apollo GraphQL -> PostgreSQL

## Start

```bash
docker compose up --build -d
```

Check status:

```bash
docker compose ps
```

## Query Property Data Product

```bash
curl http://localhost:8000/property/graphql \
  -H "Content-Type: application/json" \
  -H "apikey: local-development-key" \
  --data '{"query":"{ properties { id name type occupancyRate revenue updatedAt } }"}'
```

## Query Leasing Data Product

```bash
curl http://localhost:8000/leasing/graphql \
  -H "Content-Type: application/json" \
  -H "apikey: local-development-key" \
  --data '{"query":"{ leases { id propertyId tenantName monthlyRent status startDate endDate } }"}'
```

## Kong Admin API

```bash
curl http://localhost:8001/status
```

## Stop

```bash
docker compose down
```

To remove database volumes too:

```bash
docker compose down -v
```

## Data Product structure

Each product contains:

- `product.yaml` - ownership, classification, SLA, interface and quality metadata
- `schema.graphql` - consumer contract
- `src/server.js` - Apollo resolvers
- `quality/rules.yaml` - example data quality rules
- `db/init.sql` - schema and seed data
- `Dockerfile` - deployable runtime
