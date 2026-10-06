import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { parse } from "graphql";
import pg from "pg";

const { Pool } = pg;

const port = Number(process.env.PORT ?? 4001);
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

  type Property @key(fields: "id") {
    id: ID!
    name: String!
    type: String!
    occupancyRate: Float!
    revenue: Float!
    updatedAt: String!
  }

  type Query {
    properties: [Property!]!
    property(id: ID!): Property
  }
`);

function mapProperty(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    occupancyRate: Number(row.occupancy_rate),
    revenue: Number(row.revenue),
    updatedAt: row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : String(row.updated_at)
  };
}

async function getPropertyById(id) {
  const result = await db.query(
    `SELECT id, name, type, occupancy_rate, revenue, updated_at
       FROM properties
      WHERE id = $1`,
    [id]
  );

  return result.rows[0] ? mapProperty(result.rows[0]) : null;
}

const resolvers = {
  Query: {
    properties: async () => {
      const result = await db.query(`
        SELECT id, name, type, occupancy_rate, revenue, updated_at
          FROM properties
         ORDER BY id
      `);
      return result.rows.map(mapProperty);
    },
    property: async (_parent, { id }) => getPropertyById(id)
  },
  Property: {
    __resolveReference: async ({ id }) => getPropertyById(id)
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
