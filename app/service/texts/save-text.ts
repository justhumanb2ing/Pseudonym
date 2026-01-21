import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../../types/database.types";

export type TextSavePayload = {
	pageId: string;
	title: string;
	isActive?: boolean;
};

/**
 * Creates a text saver that persists a text item to the database.
 * No crawling required; directly saves the text content.
 */
export function createTextSaver(supabasePromise: Promise<SupabaseClient<Database>>) {
	return async function saveText(payload: TextSavePayload) {
		const supabase = await supabasePromise;

		const { error } = await supabase.rpc("add_page_item", {
			p_page_id: payload.pageId,
			p_type: "text",
			p_is_active: payload.isActive ?? true,
			p_config: {
				data: {
					title: payload.title,
				},
			},
		});

		if (error) {
			throw new Error(error.message);
		}
	};
}
