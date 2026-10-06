import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { parse } from "graphql";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "finance-db",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "finance_user",
  password: process.env.DB_PASSWORD || "finance_password",
  database: process.env.DB_NAME || "finance"
});

const typeDefs = parse(`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.3"
      import: ["@key"]
    )

  type FinancialSummary {
    annualRevenue: Float!
    operatingCost: Float!
    netOperatingIncome: Float!
  }

  type Property @key(fields: "id") {
    id: ID!
    financials: FinancialSummary
  }
`);

const resolvers = {
  Property: {
    __resolveReference(reference) {
      return {
        id: reference.id
      };
    },

    async financials(property) {
      const result = await pool.query(
        `
        SELECT
          annual_revenue AS "annualRevenue",
          operating_cost AS "operatingCost",
          net_operating_income AS "netOperatingIncome"
        FROM property_financials
        WHERE property_id = $1
        `,
        [property.id]
      );

      return result.rows[0] || null;
    }
  }
};

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
    port: 4003,
    host: "0.0.0.0"
  }
});

console.log(`Finance subgraph ready at ${url}`);
