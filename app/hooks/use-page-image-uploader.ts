import { useCallback, useEffect, useRef } from "react";

import { getSupabaseClient } from "@/lib/supabase";
import { createPageImageUploader, type PageImageUploadPayload } from "@/service/pages/upload-page-image";


/**
 * Returns a page image uploader bound to the current session.
 */
export function usePageImageUploader() {
  const supabasePromise = getSupabaseClient();
  const uploaderRef = useRef(createPageImageUploader(supabasePromise));

  useEffect(() => {
    uploaderRef.current = createPageImageUploader(supabasePromise);
  }, [supabasePromise]);

  return useCallback(
    (payload: PageImageUploadPayload) => uploaderRef.current(payload),
    []
  );
}
