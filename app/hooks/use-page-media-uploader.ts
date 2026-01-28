import { useCallback, useEffect, useRef } from "react";

import { getSupabaseClient } from "@/lib/supabase.client";
import { createPageMediaUploader, type PageMediaUploadPayload } from "@/service/pages/upload-page-media";

/**
 * Returns a page media uploader bound to the current session.
 */
export function usePageMediaUploader() {
	const supabasePromise = getSupabaseClient();
	const uploaderRef = useRef(createPageMediaUploader(supabasePromise));

	useEffect(() => {
		uploaderRef.current = createPageMediaUploader(supabasePromise);
	}, [supabasePromise]);

	return useCallback((payload: PageMediaUploadPayload) => uploaderRef.current(payload), []);
}
