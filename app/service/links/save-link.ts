import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../../types/database.types";
import { crawlLinkUrl, type CrawlLinkOptions } from "./link-crawl";

export type LinkSavePayload = {
  pageId: string;
  url: string;
  isActive?: boolean;
};

export type LinkSaveDependencies = {
  crawlOptions?: CrawlLinkOptions;
  crawlUrl?: typeof crawlLinkUrl;
};

/**
 * Creates a link saver that crawls the URL before persisting it.
 * No duplicate checks or rollback; errors bubble to the caller.
 */
export function createLinkSaver(
  supabasePromise: Promise<SupabaseClient<Database>>,
  dependencies: LinkSaveDependencies = {}
) {
  const crawl = dependencies.crawlUrl ?? crawlLinkUrl;

  return async function saveLink(payload: LinkSavePayload) {
    const supabase = await supabasePromise;
    let normalizedUrl: string;
    let response: Awaited<ReturnType<typeof crawl>>["response"];

    try {
      ({ normalizedUrl, response } = await crawl(
        payload.url,
        dependencies.crawlOptions
      ));
    } catch (error) {
      throw new Error("Crawl failed. Please try again.", { cause: error });
    }
    const { data } = response;

    const { error } = await supabase.rpc("add_page_item", {
      p_page_id: payload.pageId,
      p_type: "link",
      p_title: data.title ?? undefined,
      p_url: normalizedUrl,
      p_is_active: payload.isActive ?? true,
      p_config: {
        description: data.description,
        site_name: data.site_name,
        icon_url: data.favicon,
        image_url: data.image,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };
}
