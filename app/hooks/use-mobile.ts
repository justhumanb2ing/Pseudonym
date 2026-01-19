import { useMediaQuery } from "./use-media-query";

const MOBILE_BREAKPOINT = 767;

export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT) {
	return useMediaQuery(`(max-width: ${breakpoint ?? MOBILE_BREAKPOINT - 1}px)`);
}
