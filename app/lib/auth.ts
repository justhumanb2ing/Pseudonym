import bcrypt from "bcrypt";
import { betterAuth } from "better-auth";
import { admin } from 'better-auth/plugins';
import { PostgresDialect } from "kysely";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
  basePath: '/api/auth',
  baseURL: 'http://localhost:5173',
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [admin()],
  user: {
    additionalFields: {
      userMetadata: {
        type: 'json',
        required: true,
        input: false,
      }
    }
  }
});

// export const auth = betterAuth({
//   database: new Pool({
//     connectionString: process.env.DATABASE_URL, // Supabase Postgres URL
//   }),
// });
