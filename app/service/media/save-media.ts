import type { SupabaseClient } from "@supabase/supabase-js";

import type { PageMediaKind } from "@/service/pages/page-media";
import type { ProfileItemLayout } from "types/studio.types";
import type { Database } from "../../../types/database.types";

export type MediaSavePayload = {
	pageId: string;
	mediaUrl: string;
	mediaType: PageMediaKind;
	caption: string | null;
	url: string | null;
	isActive?: boolean;
	layout?: ProfileItemLayout;
};

/**
 * Creates a media saver that persists an image/video item to the database.
 */
export function createMediaSaver(supabasePromise: Promise<SupabaseClient<Database>>) {
	return async function saveMedia(payload: MediaSavePayload) {
		const supabase = await supabasePromise;

		const { data, error } = await supabase.rpc("add_page_item", {
			p_page_id: payload.pageId,
			p_type: "media",
			p_is_active: payload.isActive ?? true,
			p_config: {
				style: {
					layout: payload.layout ?? "compact",
				},
				data: {
					media_type: payload.mediaType,
					media_url: payload.mediaUrl,
					caption: payload.caption,
					url: payload.url,
				},
			},
		});

		if (error) {
			throw new Error(error.message);
		}

		if (!data) {
			throw new Error("Failed to save media.");
		}

		return data;
	};
}
