/** biome-ignore-all lint/correctness/useExhaustiveDependencies: map initialization should run only once */
import type { Map as MapboxMap } from "mapbox-gl";
import { useCallback, useEffect, useMemo, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";

import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/map";
import { cn } from "@/lib/utils";

export type MapCanvasControls = {
	zoomIn: () => void;
	zoomOut: () => void;
	geolocate: () => void;
};

export type MapCanvasViewport = {
	center: [number, number];
	zoom: number;
};

type MapCanvasProps = {
	center?: [number, number];
	zoom?: number;
	onControlsChange?: (controls: MapCanvasControls | null) => void;
	onViewportChange?: (viewport: MapCanvasViewport) => void;
	className?: string;
	interactive?: boolean;
};

export function MapCanvas({ center, zoom, onControlsChange, onViewportChange, className, interactive = true }: MapCanvasProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<MapboxMap | null>(null);
	const lastViewportRef = useRef<MapCanvasViewport | null>(null);
	const viewportChangeRef = useRef(onViewportChange);
	const pendingResizeRef = useRef(false);

	useEffect(() => {
		viewportChangeRef.current = onViewportChange;
	}, [onViewportChange]);

	useEffect(() => {
		if (typeof window === "undefined" || !containerRef.current) {
			return;
		}

		let cancelled = false;
		const accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
		const minSize = 80;

		if (!accessToken) {
			return;
		}

		const ensureSizedAndInit = () => {
			if (cancelled || !containerRef.current) {
				return;
			}

			const { width, height } = containerRef.current.getBoundingClientRect();
			if (width < minSize || height < minSize) {
				requestAnimationFrame(ensureSizedAndInit);
				return;
			}

			const initialCenter = center ?? MAP_DEFAULT_CENTER;
			const initialZoom = zoom ?? MAP_DEFAULT_ZOOM;
			const map = new mapboxgl.Map({
				container: containerRef.current,
				style: "mapbox://styles/justhumanb2ing/cmk406try001601pr180409zf",
				center: initialCenter,
				zoom: initialZoom,
				maxZoom: 15,
				minZoom: 7,
				interactive,
				accessToken,
				attributionControl: false,
				logoPosition: "bottom-right",
			});

			mapRef.current = map;
			lastViewportRef.current = {
				center: [initialCenter[0], initialCenter[1]],
				zoom: initialZoom,
			};
			if (pendingResizeRef.current) {
				map.resize();
				pendingResizeRef.current = false;
			}
			const scheduleResize = () => {
				let frames = 0;
				const step = () => {
					frames += 1;
					map.resize();
					const container = containerRef.current;
					const isTiny = !container || container.clientHeight < minSize || container.clientWidth < minSize;
					if ((isTiny && frames < 12) || frames < 3) {
						requestAnimationFrame(step);
					}
				};
				requestAnimationFrame(step);
			};
			scheduleResize();

			map.on("moveend", () => {
				const current = map.getCenter();
				const nextViewport: MapCanvasViewport = {
					center: [current.lng, current.lat],
					zoom: map.getZoom(),
				};
				lastViewportRef.current = nextViewport;
				viewportChangeRef.current?.(nextViewport);
			});
		};

		ensureSizedAndInit();

		return () => {
			cancelled = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (!mapRef.current || !center) {
			return;
		}

		const nextZoom = zoom ?? MAP_DEFAULT_ZOOM;
		const previous = lastViewportRef.current;
		const isSameCenter = previous?.center && previous.center[0] === center[0] && previous.center[1] === center[1];

		if (isSameCenter && previous?.zoom === nextZoom) {
			return;
		}

		lastViewportRef.current = { center, zoom: nextZoom };
		mapRef.current.flyTo({
			center,
			zoom: nextZoom,
			essential: true,
		});
	}, [center, zoom]);

	useEffect(() => {
		if (typeof ResizeObserver === "undefined" || !containerRef.current) {
			return;
		}

		const observer = new ResizeObserver(() => {
			if (mapRef.current) {
				requestAnimationFrame(() => mapRef.current?.resize());
				return;
			}
			pendingResizeRef.current = true;
		});

		observer.observe(containerRef.current);

		return () => {
			observer.disconnect();
		};
	}, []);

	const handleZoomIn = useCallback(() => {
		mapRef.current?.zoomIn();
	}, []);

	const handleZoomOut = useCallback(() => {
		mapRef.current?.zoomOut();
	}, []);

	const handleGeolocate = useCallback(() => {
		if (!mapRef.current || !navigator.geolocation) {
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const nextCenter: [number, number] = [position.coords.longitude, position.coords.latitude];
				mapRef.current?.flyTo({
					center: nextCenter,
					zoom: MAP_DEFAULT_ZOOM,
					essential: true,
				});
			},
			() => {
				// ignore location errors
			},
		);
	}, []);

	const controlsPayload = useMemo(
		() => ({
			zoomIn: handleZoomIn,
			zoomOut: handleZoomOut,
			geolocate: handleGeolocate,
		}),
		[handleZoomIn, handleZoomOut, handleGeolocate],
	);

	useEffect(() => {
		onControlsChange?.(controlsPayload);
		return () => {
			onControlsChange?.(null);
		};
	}, [onControlsChange, controlsPayload]);

	return (
		<div className="relative h-full w-full">
			{
				<div className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
					<div className="animation-duration-[2.5s] absolute -inset-2 animate-ping rounded-full bg-blue-500 opacity-75" />
					<div className="relative flex size-7 items-center justify-center rounded-full bg-white p-1 shadow-[1px_2px_13px_4px_rgba(0,0,0,0.25)]">
						<div className="size-full rounded-full bg-blue-500" />
					</div>
				</div>
			}
			<div
				ref={containerRef}
				role="application"
				aria-label="대화형 지도"
				data-vaul-no-drag
				onPointerDown={(event) => event.stopPropagation()}
				onMouseDown={(event) => event.stopPropagation()}
				onTouchStart={(event) => event.stopPropagation()}
				className={cn("map-wrapper absolute inset-0", className)}
			/>
		</div>
	);
}
