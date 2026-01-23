import type { SupabaseClient } from "@supabase/supabase-js";

import { buildGoogleMapsHref } from "@/lib/map";
import type { ProfileItemLayout } from "types/studio.types";
import type { Database } from "../../../types/database.types";

export type MapSavePayload = {
	pageId: string;
	center: [number, number];
	zoom: number;
	caption?: string | null;
	isActive?: boolean;
	layout?: ProfileItemLayout;
};

/**
 * Creates a map saver that persists the selected center/zoom to the profile items table.
 */
export function createMapSaver(supabasePromise: Promise<SupabaseClient<Database>>) {
	return async function saveMap(payload: MapSavePayload) {
	const supabase = await supabasePromise;
	const url = buildGoogleMapsHref(payload.center, payload.zoom);

	const { error } = await supabase.rpc("add_page_item", {
		p_page_id: payload.pageId,
		p_type: "map",
		p_is_active: payload.isActive ?? true,
		p_config: {
			style: {
				layout: payload.layout ?? "compact",
			},
			data: {
				url,
				caption: payload.caption ?? null,
				lat: payload.center[1],
				lng: payload.center[0],
				zoom: payload.zoom,
			},
		},
	});

		if (error) {
			throw new Error(error.message);
		}
	};
}
