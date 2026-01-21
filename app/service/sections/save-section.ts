import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../../types/database.types";

export type SectionSavePayload = {
	pageId: string;
	headline: string;
	isActive?: boolean;
};

/**
 * Creates a section saver that persists a section item to the database.
 */
export function createSectionSaver(supabasePromise: Promise<SupabaseClient<Database>>) {
	return async function saveSection(payload: SectionSavePayload) {
		const supabase = await supabasePromise;

		const { error } = await supabase.rpc("add_page_item", {
			p_page_id: payload.pageId,
			p_type: "section",
			p_is_active: payload.isActive ?? true,
			p_config: {
				data: {
					headline: payload.headline,
				},
			},
		});

		if (error) {
			throw new Error(error.message);
		}
	};
}
