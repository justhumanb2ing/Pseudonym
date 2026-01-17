import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

import { trackUmamiEvent, trackUmamiPageView, type UmamiEventProps } from "@/lib/umami";
import type { UmamiEventName } from "@/lib/umami-events";

type UseUmamiPageViewOptions = {
	url?: string;
	title?: string;
	props?: UmamiEventProps;
	eventName?: UmamiEventName;
	dedupeKey?: string;
};

export function useUmamiPageView(options: UseUmamiPageViewOptions = {}) {
	const location = useLocation();
	const trackedRef = useRef<string | null>(null);

	useEffect(() => {
		const url = options.url ?? location.pathname;
		const title = options.title ?? document.title;
		const trackingKey = options.dedupeKey ?? `${location.key}:${url}`;

		if (trackedRef.current === trackingKey) {
			return;
		}

		trackedRef.current = trackingKey;

		trackUmamiPageView({
			url,
			title,
			props: options.props,
			options: { dedupeKey: `pageview:${trackingKey}`, once: true },
		});

		if (options.eventName) {
			trackUmamiEvent(options.eventName, options.props, {
				dedupeKey: `pageevent:${trackingKey}`,
				once: true,
			});
		}
	}, [location.key, location.pathname, options.url, options.title, options.eventName, options.dedupeKey, options.props]);
}
