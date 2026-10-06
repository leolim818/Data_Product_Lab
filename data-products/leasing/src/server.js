import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { parse } from "graphql";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "leasing-db",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "leasing_user",
  password: process.env.DB_PASSWORD || "leasing_password",
  database: process.env.DB_NAME || "leasing"
});

const port = Number(process.env.PORT ?? 4002);
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const db = new Pool({ connectionString: databaseUrl });

const typeDefs = parse(`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.3"
      import: ["@key"]
    )

  type Lease {
    id: ID!
    propertyId: ID!
    tenantName: String!
    monthlyRent: Float!
    status: String!
    startDate: String!
    endDate: String!
  }

  type Property @key(fields: "id") {
    id: ID!
    leases: [Lease!]!
  }

  type Query {
    leases: [Lease!]!
    lease(id: ID!): Lease
  }
`);

function mapLease(row) {
  return {
    id: row.id,
    propertyId: row.property_id,
    tenantName: row.tenant_name,
    monthlyRent: Number(row.monthly_rent),
    status: row.status,
    startDate: row.start_date instanceof Date
      ? row.start_date.toISOString().slice(0, 10)
      : String(row.start_date),
    endDate: row.end_date instanceof Date
      ? row.end_date.toISOString().slice(0, 10)
      : String(row.end_date),
    updatedAt: row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : String(row.updated_at)
  };
}

const resolvers = {
  Query: {
    leases: async () => {
      const result = await db.query(`
        SELECT id, property_id, tenant_name, monthly_rent, status,
               start_date, end_date
          FROM leases
         ORDER BY id
      `);
      return result.rows.map(mapLease);
    },
    lease: async (_parent, { id }) => {
      const result = await db.query(
        `SELECT id, property_id, tenant_name, monthly_rent, status,
                start_date, end_date
           FROM leases
          WHERE id = $1`,
        [id]
      );
      return result.rows[0] ? mapLease(result.rows[0]) : null;
    }
  },
  Property: {
    __resolveReference(reference) {
      return { id: reference.id };
    },

    async leases(property) {
      const result = await pool.query(
        `SELECT
           id,
           property_id AS "propertyId",
           tenant_name AS "tenantName",
           monthly_rent AS "monthlyRent",
           status
         FROM leases
         WHERE property_id = $1`,
        [property.id]
      );

      return result.rows;
    }
  }
};

console.log("Schema type:", typeDefs.kind);
console.log(
  "Definitions array:",
  Array.isArray(typeDefs.definitions)
);

const schema = buildSubgraphSchema([
  {
    typeDefs,
    resolvers
  }
]);

const server = new ApolloServer({
  schema
});

const { url } = await startStandaloneServer(server, {
  listen: {
    host: "0.0.0.0",
    port
  }
});

console.log(`Subgraph running at ${url}`);
