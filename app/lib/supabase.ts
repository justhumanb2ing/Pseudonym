import { createClient } from "@supabase/supabase-js";

import type { Database } from "../../types/database.types";
import type { Route } from "../+types/root";
import { getAuth } from "@clerk/react-router/server";
import { useSession } from "@clerk/react-router";

const supabaseUrl = import.meta.env.VITE_SB_URL!;
const supabaseKey = import.meta.env.VITE_SB_PUBLISHABLE_KEY!;

/**
 * Creates a server-only Supabase client using the service role key.
 */
export async function getSupabaseServerClient(
  args: Route.LoaderArgs | Route.ActionArgs
) {
  const { getToken } = await getAuth(args);

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    async accessToken() {
      return getToken();
    },
  });
}

export async function getSupabaseClient() {
  const { session } = useSession();
  return createClient<Database>(supabaseUrl, supabaseKey, {
    async accessToken() {
      return session?.getToken() ?? null;
    },
  });
}
