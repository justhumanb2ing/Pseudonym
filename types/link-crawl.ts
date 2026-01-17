export type CrawlMode = "static" | "dynamic";

export interface OgData {
	title: string | null;
	description: string | null;
	url: string | null;
	site_name: string | null;
	image: string | null;
	favicon: string | null;
}

export interface OgCrawlResponse {
	ok: true;
	mode: CrawlMode;
	fallback: boolean;
	durationMs: number;
	data: OgData;
}
