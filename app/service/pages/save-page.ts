import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "../../../types/database.types";

export type PageSnapshot = {
	title: string | null;
	description: string | null;
	image_url: string | null;
	layout: Json | null;
};

export type PageSavePayload = PageSnapshot & {
	pageId: string;
};

/**
 * Creates a savePage function bound to a Supabase client promise.
 * Keeps auto-save logic independent from Supabase client creation.
 */
export function createPageSaver(supabasePromise: Promise<SupabaseClient<Database>>) {
	return async function savePage(payload: PageSavePayload) {
		const supabase = await supabasePromise;
		const updatePayload: Database["public"]["Tables"]["pages"]["Update"] = {
			title: payload.title ?? "",
			description: payload.description ?? null,
			image_url: payload.image_url ?? null,
		};

		const { error } = await supabase.from("pages").update(updatePayload).eq("id", payload.pageId);

		if (error) {
			throw new Error(error.message);
		}

		const { error: layoutError } = await supabase.rpc("save_page_layout", {
			p_layout: payload.layout ?? null,
			p_page_id: payload.pageId,
		});

		if (layoutError) {
			throw new Error(layoutError.message);
		}
	};
}
