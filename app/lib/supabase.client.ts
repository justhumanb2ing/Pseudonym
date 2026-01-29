import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database.types";
import { authClient } from "./auth.client";

const supabaseUrl = import.meta.env.VITE_SB_URL;
const supabaseKey = import.meta.env.VITE_SB_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase client environment variables.");
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

type ClientSession = Awaited<ReturnType<typeof authClient.getSession>>["data"] | null;

const SESSION_CACHE_TTL_MS = 5_000;
let cachedSession: ClientSession | null = null;
let cachedSessionAt = 0;
let sessionPromise: Promise<ClientSession | null> | null = null;

let setUserIdPromise: Promise<void> | null = null;
let setUserIdFor: string | null = null;

async function getCachedSession() {
	const now = Date.now();
	if (cachedSessionAt && now - cachedSessionAt < SESSION_CACHE_TTL_MS) {
		return cachedSession;
	}

	if (sessionPromise) {
		return sessionPromise;
	}

	sessionPromise = authClient
		.getSession()
		.then(({ data }) => {
			cachedSession = data ?? null;
			cachedSessionAt = Date.now();
			return cachedSession;
		})
		.finally(() => {
			sessionPromise = null;
		});

	return sessionPromise;
}

async function ensureUserId(userId: string) {
	if (setUserIdPromise && setUserIdFor === userId) {
		return setUserIdPromise;
	}

	setUserIdFor = userId;
	setUserIdPromise = supabase
		.rpc("set_user_id", { user_id: userId })
		.then(() => undefined)
		.finally(() => {
			if (setUserIdFor === userId) {
				setUserIdPromise = null;
				setUserIdFor = null;
			}
		});

	return setUserIdPromise;
}

export async function getSupabaseClient() {
	const session = await getCachedSession();

	if (session?.user?.id) {
		await ensureUserId(session.user.id);
	}

	return supabase;
}
