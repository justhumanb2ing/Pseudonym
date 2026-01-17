export const PREVIEW_QUERY_KEY = "preview";
export const PREVIEW_QUERY_VALUE = "1";
export const PREVIEW_MESSAGE_TYPE = "preview:revalidate";

export type PreviewMessage = {
	type: typeof PREVIEW_MESSAGE_TYPE;
};

/**
 * Checks if the request URL is in preview mode.
 */
export const isPreviewRequest = (request: Request): boolean => {
	const url = new URL(request.url);
	return url.searchParams.get(PREVIEW_QUERY_KEY) === PREVIEW_QUERY_VALUE;
};

/**
 * Checks if a search string is in preview mode.
 */
export const isPreviewSearch = (search: string): boolean => {
	const params = new URLSearchParams(search);
	return params.get(PREVIEW_QUERY_KEY) === PREVIEW_QUERY_VALUE;
};

/**
 * Adds preview query params to a path or URL.
 */
export const buildPreviewPath = (pathname: string): string => {
	const url = new URL(pathname, "http://preview.local");
	url.searchParams.set(PREVIEW_QUERY_KEY, PREVIEW_QUERY_VALUE);
	return `${url.pathname}${url.search}`;
};

export const isPreviewMessage = (data: unknown): data is PreviewMessage => {
	if (!data || typeof data !== "object") {
		return false;
	}
	return (data as { type?: unknown }).type === PREVIEW_MESSAGE_TYPE;
};
