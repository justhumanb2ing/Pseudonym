import { Crosshair, Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";
import type { ProfileItemLayout, StudioOutletContext } from "types/studio.types";
import type { MapCanvasControls, MapCanvasViewport } from "@/components/map/map-canvas";
import { MapSearch } from "@/components/map/map-search";

// Mapbox 지연 로드 - 초기 번들 크기 794KB 감소
const LazyMapCanvas = lazy(() =>
	import("@/components/map/map-canvas").then((module) => ({ default: module.MapCanvas }))
);
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import ItemLayoutSelector from "@/components/studio/item-layout-selector";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/map";
import type { PageProfileActionData } from "@/service/pages/page-profile.action";

type ProfileItem = StudioOutletContext["profileItems"][number];

export function MapItemExpandedContent({ item }: { item: ProfileItem }) {
	const updateFetcher = useFetcher<PageProfileActionData>();
	const deleteFetcher = useFetcher<PageProfileActionData>();
	const [open, setOpen] = useState(false);
	const configData = item.config?.data;
	const initialLat = configData?.lat;
	const initialLng = configData?.lng;
	const initialZoom = configData?.zoom;
	const initialCenter =
		Number.isFinite(initialLat) && Number.isFinite(initialLng) ? ([initialLng, initialLat] as [number, number]) : MAP_DEFAULT_CENTER;
	const initialZoomValue = Number.isFinite(initialZoom) ? initialZoom : MAP_DEFAULT_ZOOM;

	const [center, setCenter] = useState<[number, number]>(initialCenter);
	const [zoom, setZoom] = useState(initialZoomValue);
	const [controls, setControls] = useState<MapCanvasControls | null>(null);
	const [caption, setCaption] = useState(configData?.caption ?? "");
	const [mapKey, setMapKey] = useState(0);
	const [layout, setLayout] = useState<ProfileItemLayout>(item.config?.style?.layout ?? "compact");

	const isSaving = updateFetcher.state !== "idle";
	const isDeleting = deleteFetcher.state !== "idle";
	const formId = `map-item-edit-${item.id}`;
	const updateError =
		updateFetcher.data?.intent === "map-update" && !updateFetcher.data?.success ? updateFetcher.data.formError : undefined;

	const handleViewportChange = (viewport: MapCanvasViewport) => {
		setCenter(viewport.center);
		setZoom(viewport.zoom);
	};

	const handleSearchSelect = (result: { center: [number, number]; place_name: string }) => {
		setCenter(result.center);
		setZoom(MAP_DEFAULT_ZOOM);
		setCaption((prev) => (prev.trim().length > 0 ? prev : result.place_name));
	};

	const controlButtons = useMemo(
		() => [
			{ key: "zoom-in", icon: Plus, onClick: () => controls?.zoomIn() },
			{ key: "zoom-out", icon: Minus, onClick: () => controls?.zoomOut() },
			{ key: "geolocate", icon: Crosshair, onClick: () => controls?.geolocate() },
		],
		[controls],
	);

	const handleConfirmDelete = () => {
		setOpen(false);
		deleteFetcher.submit(
			{ intent: "link-remove", itemId: item.id },
			{
				method: "post",
			},
		);
	};

	useEffect(() => {
		const timeout = setTimeout(() => setMapKey((current) => current + 1), 200);
		return () => clearTimeout(timeout);
	}, []);

	return (
		<div className="flex h-full w-full flex-col justify-between gap-5">
			<updateFetcher.Form id={formId} method="post" className="flex flex-col gap-4">
				<input type="hidden" name="intent" value="map-update" />
				<input type="hidden" name="itemId" value={item.id} />
				<input type="hidden" name="lat" value={String(center[1])} />
				<input type="hidden" name="lng" value={String(center[0])} />
				<input type="hidden" name="zoom" value={String(zoom)} />
				<input type="hidden" name="layout" value={layout} />

				<div className="relative h-56 shrink-0 overflow-hidden rounded-2xl border bg-muted/10 md:h-80" data-vaul-no-drag>
					<Suspense fallback={<div className="h-full w-full animate-pulse bg-muted/40" />}>
						<LazyMapCanvas
							key={mapKey}
							center={center}
							zoom={zoom}
							onControlsChange={setControls}
							onViewportChange={handleViewportChange}
							className="h-full w-full"
						/>
					</Suspense>
					<div className="absolute top-2 right-2">
						<ButtonGroup orientation={"vertical"} className="w-fit -space-y-0.5" aria-label="Map Controls">
							{controlButtons.map((button) => (
								<Button key={button.key} type="button" size="icon" onClick={button.onClick} disabled={!controls || isSaving}>
									<motion.p whileTap={{ scale: 0.8 }}>
										<button.icon className="size-4" />
									</motion.p>
								</Button>
							))}
						</ButtonGroup>
					</div>
				</div>

				<div className="flex flex-col gap-3">
					<Input
						name="caption"
						value={caption}
						onChange={(event) => setCaption(event.target.value)}
						placeholder="Caption"
						autoComplete="off"
						readOnly={isSaving}
						className="h-10 rounded-xl"
					/>
					<MapSearch onSelect={handleSearchSelect} disabled={isSaving || !import.meta.env.VITE_MAPBOX_ACCESS_TOKEN} />
				</div>

				{updateError ? <p className="text-destructive text-xs/relaxed">{updateError}</p> : null}
				<ItemLayoutSelector value={layout} onChange={setLayout} disabled={isSaving} />
			</updateFetcher.Form>

			<footer className="flex items-center gap-3">
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogTrigger
						render={
							<Button variant={"destructive"} size={"lg"} className="flex-1 basis-0" disabled={isDeleting}>
								{isDeleting ? "Deleting..." : "Delete"}
							</Button>
						}
					/>
					<AlertDialogContent
						className={"p-5"}
						onMouseDown={(event) => event.stopPropagation()}
						onTouchStart={(event) => event.stopPropagation()}
					>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete map?</AlertDialogTitle>
							<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel variant={"secondary"} disabled={isDeleting} className={"flex-1 basis-0"}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								variant="destructive"
								onClick={handleConfirmDelete}
								disabled={isDeleting}
								aria-busy={isDeleting}
								className={"flex-1 basis-0"}
							>
								{isDeleting ? "Deleting..." : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
				<Button variant={"brand"} size={"lg"} className="flex-1 basis-0" type="submit" form={formId} disabled={isSaving}>
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</footer>
		</div>
	);
}
