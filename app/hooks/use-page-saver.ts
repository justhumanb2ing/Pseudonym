import { useMemo } from "react";

import { getSupabaseClient } from "@/lib/supabase";
import { createPageSaver } from "../service/pages/save-page";

/**
 * Returns a savePage function bound to the current session's Supabase client.
 */
export function usePageSaver() {
  const supabasePromise = getSupabaseClient();

  return useMemo(
    () => createPageSaver(supabasePromise),
    [supabasePromise]
  );
}
