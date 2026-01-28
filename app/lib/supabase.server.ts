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
/**
 * Creates a server-only Supabase client.
 */
export async function getSupabaseServerClient(args: Route.LoaderArgs | Route.ActionArgs) {
	const session = await auth.api.getSession({
		headers: args.request.headers
	})

	if (session?.user?.id) {
		await supabase.rpc("set_user_id", { user_id: session.user.id });
	}

	return supabase
}
