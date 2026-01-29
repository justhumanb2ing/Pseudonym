import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database.types";
import type { Route } from "../+types/root";
import { auth } from "./auth.server";

const supabaseUrl = import.meta.env.VITE_SB_URL;
const supabaseKey = import.meta.env.VITE_SB_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Missing Supabase server environment variables.");
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

type ServerSession = Awaited<ReturnType<typeof auth.api.getSession>>;
type SupabaseServerClientOptions = {
	session?: ServerSession;
	userId?: string;
};
/**
 * Creates a server-only Supabase client.
 */
export async function getSupabaseServerClient(
	args: Route.LoaderArgs | Route.ActionArgs,
	options: SupabaseServerClientOptions = {},
) {
	const session =
		options.session ??
		(options.userId
			? undefined
			: await auth.api.getSession({
					headers: args.request.headers,
				}));
	const userId = options.userId ?? session?.user?.id;

	if (userId) {
		await supabase.rpc("set_user_id", { user_id: userId });
	}

	return supabase;
}
