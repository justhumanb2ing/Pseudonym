import type { Json, Tables } from "./database.types";

type ProfileItemConfig = {
	icon_url?: string | null;
	[key: string]: Json | undefined;
};

type StudioProfileItem = Omit<Tables<"profile_items">, "config"> & {
	config?: ProfileItemConfig | null;
};

export interface StudioOutletContext {
	page: Omit<Tables<"pages">, "created_at" | "updated_at">;
	handle: string;
	profileItems: Array<StudioProfileItem>;
}
