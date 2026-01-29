import { AsyncLocalStorage } from "node:async_hooks";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";

type RequestContext = {
	connectionString?: string;
	env?: Env;
	authInstance?: ReturnType<typeof betterAuth>;
};

// AsyncLocalStorage를 사용하여 요청 컨텍스트에서 connectionString/env 공유
const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function runWithConnectionString<T>(
	connectionString: string,
	env: Env | undefined,
	fn: () => T,
): T {
	return requestContextStorage.run({ connectionString, env }, fn);
}

function getRuntimeEnvValue<Key extends keyof Env>(key: Key) {
	return requestContextStorage.getStore()?.env?.[key] ?? process.env[key];
}

function isHyperdriveConnection(connectionString: string): boolean {
	return connectionString.includes(".hyperdrive.local");
}

// 요청별로 auth 인스턴스 생성 (Cloudflare Workers에서 I/O 객체는 요청 간 공유 불가)
function createAuth(connectionString: string) {
	const betterAuthSecret = getRuntimeEnvValue("BETTER_AUTH_SECRET");
	const useHyperdrive = isHyperdriveConnection(connectionString);
	const sql = postgres(connectionString, {
		ssl: useHyperdrive ? false : "require",
		max: 1,
		prepare: false,
		connect_timeout: 10,
	});

	return betterAuth({
		...(betterAuthSecret ? { secret: betterAuthSecret } : {}),
		database: new PostgresJSDialect({
			postgres: sql,
		}),
		basePath: "/api/auth",
		baseURL: getRuntimeEnvValue("BETTER_AUTH_URL"),
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
				clientId: getRuntimeEnvValue("GOOGLE_CLIENT_ID"),
				clientSecret: getRuntimeEnvValue("GOOGLE_CLIENT_SECRET"),
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
}

// 같은 요청 내에서는 동일 인스턴스 재사용, 요청 간에는 새로 생성
function getAuthForRequest(connectionString: string) {
	const context = requestContextStorage.getStore();
	if (context?.authInstance) {
		return context.authInstance;
	}
	const authInstance = createAuth(connectionString);
	if (context) {
		context.authInstance = authInstance;
	}
	return authInstance;
}

// 기존 코드와 호환되는 auth 객체 (Proxy 사용)
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
	get(_, prop) {
		const context = requestContextStorage.getStore();
		const connectionString =
			context?.connectionString ??
			context?.env?.DIRECT_URL ??
			process.env.DIRECT_URL;

		if (!connectionString) {
			throw new Error("DATABASE_URL environment variable is not set");
		}
		const authInstance = getAuthForRequest(connectionString);
		return (authInstance as Record<string, unknown>)[prop as string];
	},
});

export type Auth = typeof auth;
