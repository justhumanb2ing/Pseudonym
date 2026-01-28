import { AsyncLocalStorage } from "node:async_hooks";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";

// AsyncLocalStorage를 사용하여 요청 컨텍스트에서 connectionString 공유
const connectionStringStorage = new AsyncLocalStorage<string>();

export function runWithConnectionString<T>(connectionString: string, fn: () => T): T {
	return connectionStringStorage.run(connectionString, fn);
}

// 캐싱을 위한 Map
const authCache = new Map<string, ReturnType<typeof betterAuth>>();

function getOrCreateAuth(connectionString: string) {
	let authInstance = authCache.get(connectionString);
	if (!authInstance) {
		const sql = postgres(connectionString, {
			ssl: "require",
			max: 1,
			prepare: false,
		});

		authInstance = betterAuth({
			database: new PostgresJSDialect({
				postgres: sql,
			}),
			basePath: "/api/auth",
			baseURL: process.env.BETTER_AUTH_URL,
			emailAndPassword: {
				enabled: true,
			},
			session: {
				cookieCache: {
					enabled: true,
					maxAge: 5 * 60,
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
						defaultValue: { onboardingComplete: false },
					},
				},
				deleteUser: {
					enabled: true,
				},
			},
		});
		authCache.set(connectionString, authInstance);
	}
	return authInstance;
}

// 기존 코드와 호환되는 auth 객체 (Proxy 사용)
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
	get(_, prop) {
		// Hyperdrive connectionString 또는 로컬 환경의 DATABASE_URL 사용
		const connectionString = connectionStringStorage.getStore() ?? process.env.DATABASE_URL;
		if (!connectionString) {
			throw new Error("DATABASE_URL environment variable is not set");
		}
		const authInstance = getOrCreateAuth(connectionString);
		return (authInstance as Record<string, unknown>)[prop as string];
	},
});

export type Auth = typeof auth;
