import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";

export const auth = betterAuth({
	database: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL,
		}),
	}),
	basePath: "/api/auth",
	baseURL: process.env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60 // Cache duration in seconds (5 minutes)
		},
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		},
	},
	plugins: [admin()],
	user: {
		additionalFields: {
			userMetadata: {
				type: "json",
				required: false,
				input: false,
				defaultValue: { "onboardingComplete": false },
			},
		},
		deleteUser: {
			enabled: true
		}
	},
});
