import { addDays } from "date-fns";

export type UmamiResponse = {
	ok: boolean;
	status?: number;
	data?: {
		visits: number;
	};
	error?: unknown;
};

type UmamiConfig = {
	apiEndpoint: string;
	apiKey: string;
	websiteId: string;
};

export const UMAMI_TIMEZONE = "Asia/Seoul";
export const UMAMI_UNIT = "day";

const UMAMI_ENDPOINT_PATH = "websites";

function getDateParts(value: Date, timeZone: string) {
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const parts = formatter.formatToParts(value);
	const year = Number(parts.find((part) => part.type === "year")?.value);
	const month = Number(parts.find((part) => part.type === "month")?.value);
	const day = Number(parts.find((part) => part.type === "day")?.value);

	if (!year || !month || !day) {
		throw new Error("Failed to resolve date parts.");
	}

	return { year, month, day };
}

function getTimeZoneOffsetMs(timeZone: string, value: Date) {
	const tzDate = new Date(value.toLocaleString("en-US", { timeZone }));
	const utcDate = new Date(value.toLocaleString("en-US", { timeZone: "UTC" }));

	return tzDate.getTime() - utcDate.getTime();
}

function getStartOfDayMs(timeZone: string, value: Date) {
	const { year, month, day } = getDateParts(value, timeZone);
	const utcMidnight = new Date(Date.UTC(year, month - 1, day));
	const offsetMs = getTimeZoneOffsetMs(timeZone, utcMidnight);

	return utcMidnight.getTime() - offsetMs;
}

/**
 * Returns a start/end range covering today in the provided timezone.
 */
export function getTodayRange(timeZone: string) {
	const today = new Date();
	const startAt = getStartOfDayMs(timeZone, today);
	const endAt = addDays(new Date(startAt), 1).getTime();

	return { startAt, endAt };
}

/**
 * Resolves Umami API credentials from environment variables.
 */
export function resolveUmamiConfig(): UmamiConfig | null {
	const apiKey = process.env.UMAMI_API_KEY;
	const apiEndpoint = process.env.UMAMI_API_CLIENT_ENDPOINT;
	const websiteId = process.env.UMAMI_WEBSITE_ID ?? process.env.VITE_UMAMI_WEBSITE_ID;

	if (!apiKey || !apiEndpoint || !websiteId) {
		return null;
	}

	return { apiEndpoint, apiKey, websiteId };
}

function getVisitsFromPayload(payload: unknown) {
	if (!payload || typeof payload !== "object") {
		return null;
	}

	if (!("visits" in payload)) {
		return null;
	}

	const visits = (payload as { visits?: unknown }).visits;
	return typeof visits === "number" ? visits : null;
}

/**
 * Fetches Umami visit stats for the given website and time range.
 */
export async function fetchUmamiVisits(params: {
	apiEndpoint: string;
	apiKey: string;
	websiteId: string;
	startAt: number;
	endAt: number;
	unit: string;
	timezone: string;
	pageId: string;
}): Promise<UmamiResponse> {
	const baseUrl = params.apiEndpoint.endsWith("/") ? params.apiEndpoint : `${params.apiEndpoint}/`;
	const metricsUrl = new URL(`${UMAMI_ENDPOINT_PATH}/${params.websiteId}/metrics/expanded`, baseUrl);
	const searchParams = new URLSearchParams({
		startAt: String(params.startAt),
		endAt: String(params.endAt),
		type: "path",
		path: `/user/${params.pageId}`,
		unit: params.unit,
		timezone: params.timezone,
	});

	metricsUrl.search = searchParams.toString();

	const response = await fetch(metricsUrl.toString(), {
		headers: {
			Accept: "application/json",
			"x-umami-api-key": params.apiKey,
		},
	});

	const payload = await response.json().catch(() => null);
	const visits = getVisitsFromPayload(payload[0]);

	if (!response.ok || visits === null) {
		return {
			ok: false,
			status: response.status,
			error: payload ?? "Failed to fetch Umami stats or missing visits in response.",
		};
	}

	return {
		ok: true,
		status: response.status,
		data: {
			visits,
		},
	};
}
