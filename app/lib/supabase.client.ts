import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database.types";
import { authClient } from "./auth.client";

const supabaseUrl = import.meta.env.VITE_SB_URL;
const supabaseKey = import.meta.env.VITE_SB_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase client environment variables.");
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function getSupabaseClient() {
  const { data: session } = await authClient.getSession();

  if (session?.user?.id) {
    await supabase.rpc("set_user_id", { user_id: session.user.id });
  }

  return supabase;
}