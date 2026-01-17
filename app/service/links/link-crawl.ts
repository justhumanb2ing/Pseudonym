import { z } from "zod";

import type { OgCrawlResponse } from "../../../types/link-crawl";

const crawlResponseSchema = z.object({
	ok: z.literal(true),
	mode: z.enum(["static", "dynamic"]),
	fallback: z.boolean(),
	durationMs: z.number(),
	data: z.object({
		title: z.string().nullable(),
		description: z.string().nullable(),
		url: z.string().nullable(),
		site_name: z.string().nullable(),
		image: z.string().nullable(),
		favicon: z.string().nullable(),
	}),
});

const RETRY_DELAYS_MS = [500, 1500, 3000] as const;
const JITTER_RATIO = 0.2;

export type CrawlLinkOptions = {
	baseUrl?: string;
	fetcher?: typeof fetch;
	maxAttempts?: number;
	random?: () => number;
	sleep?: (delayMs: number) => Promise<void>;
	signal?: AbortSignal;
};

export type CrawlLinkResult = {
	normalizedUrl: string;
	response: OgCrawlResponse;
};

/**
 * Normalizes user input into a crawl-ready URL.
 * Only rejects empty input.
 */
export function normalizeLinkUrl(input: string) {
	const trimmed = input.trim();
	if (!trimmed) {
		throw new Error("URL is required.");
	}

	if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
		return trimmed;
	}

	return `https://${trimmed}`;
}

/**
 * Crawls a URL with bounded retries and exponential backoff.
 */
export async function crawlLinkUrl(inputUrl: string, options: CrawlLinkOptions = {}): Promise<CrawlLinkResult> {
	const normalizedUrl = normalizeLinkUrl(inputUrl);
	const baseUrl = options.baseUrl ?? resolveCrawlerBaseUrl();
	const fetcher = options.fetcher ?? fetch;
	const random = options.random ?? Math.random;
	const sleep = options.sleep ?? defaultSleep;
	const maxAttempts = Math.min(options.maxAttempts ?? RETRY_DELAYS_MS.length, RETRY_DELAYS_MS.length);

	let lastError: Error | null = null;

	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		try {
			const response = await fetcher(buildCrawlerUrl(baseUrl, normalizedUrl), {
				method: "GET",
				signal: options.signal,
			});

			if (!response.ok) {
				throw new Error(`Crawler request failed with ${response.status}.`);
			}

			const payload = (await response.json()) as unknown;
			const parsed = crawlResponseSchema.safeParse(payload);

			if (!parsed.success) {
				throw new Error("Crawler response is invalid.");
			}

			return {
				normalizedUrl,
				response: parsed.data,
			};
		} catch (error) {
			lastError = error instanceof Error ? error : new Error("Crawl failed.");

			if (attempt < maxAttempts - 1) {
				const delayMs = applyJitter(RETRY_DELAYS_MS[attempt], random);
				await sleep(delayMs);
			}
		}
	}

	throw lastError ?? new Error("Crawl failed.");
}

function resolveCrawlerBaseUrl() {
	const endpoint = import.meta.env.VITE_CRAWLER_SERVER_ENDPOINT ?? process.env.VITE_CRAWLER_SERVER_ENDPOINT;

	if (!endpoint) {
		throw new Error("Missing crawler server endpoint.");
	}

	return endpoint;
}

function buildCrawlerUrl(baseUrl: string, normalizedUrl: string) {
	const url = new URL("/api/crawl", baseUrl);
	url.searchParams.set("url", normalizedUrl);
	url.searchParams.set("mode", "auto");
	return url.toString();
}

function applyJitter(delayMs: number, random: () => number) {
	const offset = (random() * 2 - 1) * JITTER_RATIO;
	return Math.max(0, Math.round(delayMs + delayMs * offset));
}

function defaultSleep(delayMs: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, delayMs);
	});
}
