import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProfileItemLayout } from "types/studio.types";
import type { Database } from "../../../types/database.types";
import { type CrawlLinkOptions, crawlLinkUrl } from "./link-crawl";

export type LinkSavePayload = {
	pageId: string;
	url: string;
	isActive?: boolean;
	layout?: ProfileItemLayout;
};

export type LinkSaveDependencies = {
	crawlOptions?: CrawlLinkOptions;
	crawlUrl?: typeof crawlLinkUrl;
};

/**
 * Creates a link saver that crawls the URL before persisting it.
 * No duplicate checks or rollback; errors bubble to the caller.
 */
export function createLinkSaver(supabasePromise: Promise<SupabaseClient<Database>>, dependencies: LinkSaveDependencies = {}) {
	const crawl = dependencies.crawlUrl ?? crawlLinkUrl;

	return async function saveLink(payload: LinkSavePayload) {
		const supabase = await supabasePromise;
		let normalizedUrl: string;
		let response: Awaited<ReturnType<typeof crawl>>["response"];

		try {
			({ normalizedUrl, response } = await crawl(payload.url, dependencies.crawlOptions));
		} catch (error) {
			throw new Error("Crawl failed. Please try again.", { cause: error });
		}
		const { data: crawlData } = response;

		const { data: item, error } = await supabase.rpc("add_page_item", {
			p_page_id: payload.pageId,
			p_type: "link",
			p_is_active: payload.isActive ?? true,
			p_config: {
				style: {
					layout: payload.layout ?? "compact",
				},
				data: {
					url: normalizedUrl,
					title: crawlData.title ?? null,
					description: crawlData.description,
					site_name: crawlData.site_name,
					icon_url: crawlData.favicon,
					image_url: crawlData.image,
				},
			},
		});

		if (error) {
			throw new Error(error.message);
		}

		if (!item) {
			throw new Error("Failed to save link.");
		}

		return item;
	};
}
