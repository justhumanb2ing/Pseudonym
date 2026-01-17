import * as React from "react";

type UseMediaQueryOptions = {
	defaultValue?: boolean;
	initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === "undefined";

export function useMediaQuery(query: string, { defaultValue = false, initializeWithValue = true }: UseMediaQueryOptions = {}): boolean {
	const getMatches = (query: string): boolean => {
		if (IS_SERVER) {
			return defaultValue;
		}
		return window.matchMedia(query).matches;
	};

	const [matches, setMatches] = React.useState<boolean>(() => {
		if (initializeWithValue) {
			return getMatches(query);
		}
		return defaultValue;
	});

	React.useEffect(() => {
		const matchMedia = window.matchMedia(query);

		const handleChange = () => {
			setMatches(matchMedia.matches);
		};

		handleChange();

		matchMedia.addEventListener("change", handleChange);

		return () => {
			matchMedia.removeEventListener("change", handleChange);
		};
	}, [query]);

	return matches;
}

export type { UseMediaQueryOptions };
