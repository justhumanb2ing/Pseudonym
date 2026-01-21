export const MAP_DEFAULT_CENTER: [number, number] = [126.9970831, 37.550263];
export const MAP_DEFAULT_ZOOM = 13;

export function buildGoogleMapsHref(center: [number, number], zoom: number) {
	const [lng, lat] = center;
	return `https://www.google.com/maps/@${lat},${lng},${zoom}z`;
}
