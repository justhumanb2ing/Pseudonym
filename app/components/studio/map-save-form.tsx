import { Crosshair, Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";
import { MapCanvas, type MapCanvasControls, type MapCanvasViewport } from "@/components/map/map-canvas";
import { MapSearch } from "@/components/map/map-search";
import ItemLayoutSelector from "@/components/studio/item-layout-selector";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/map";
import type { PageProfileActionData } from "@/service/pages/page-profile.action";
import type { ProfileItemLayout } from "types/studio.types";

const DEFAULT_CENTER: [number, number] = MAP_DEFAULT_CENTER;

type MapSaveFormProps = {
	pageId: string;
	onSuccess?: () => void;
	onCancel?: () => void;
};

export default function MapSaveForm({ pageId, onSuccess, onCancel }: MapSaveFormProps) {
	const fetcher = useFetcher<PageProfileActionData>();
	const actionData = fetcher.data;
	const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
	const [zoom, setZoom] = useState(MAP_DEFAULT_ZOOM);
	const [controls, setControls] = useState<MapCanvasControls | null>(null);
	const [caption, setCaption] = useState("");
	const [layout, setLayout] = useState<ProfileItemLayout>("compact");

	const isSaving = fetcher.state !== "idle";
	const formError = actionData?.intent === "map-save" && !actionData?.success ? actionData.formError : undefined;

	useEffect(() => {
		if (actionData?.success && actionData.intent === "map-save") {
			setCenter(DEFAULT_CENTER);
			setZoom(MAP_DEFAULT_ZOOM);
			setCaption("");
			setLayout("compact");
			onSuccess?.();
		}
	}, [actionData?.success, actionData?.intent, onSuccess]);

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

	return (
		<fetcher.Form method="post" className="flex h-full flex-col gap-4 p-2" noValidate>
			<input type="hidden" name="intent" value="map-save" />
			<input type="hidden" name="pageId" value={pageId} />
			<input type="hidden" name="lat" value={String(center[1])} />
			<input type="hidden" name="lng" value={String(center[0])} />
			<input type="hidden" name="zoom" value={String(zoom)} />
			<input type="hidden" name="layout" value={layout} />

			<div className="relative h-40 shrink-0 overflow-hidden rounded-2xl border bg-muted/10 md:h-64" data-vaul-no-drag>
				<MapCanvas
					center={center}
					zoom={zoom}
					onControlsChange={setControls}
					onViewportChange={handleViewportChange}
					className="h-full w-full"
				/>
				<div className="absolute top-2 right-2">
					<ButtonGroup orientation={"vertical"} className="w-fit -space-y-0.5" aria-label="Map Controls">
						{controlButtons.map((button) => (
							<Button key={button.key} type="button" size="icon" onClick={button.onClick} disabled={!controls}>
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

			{formError ? <p className="text-destructive text-xs/relaxed">{formError}</p> : null}
			<ItemLayoutSelector value={layout} onChange={setLayout} disabled={isSaving} />

			<div className="flex gap-2">
				{onCancel ? (
					<Button type="button" size="lg" variant="secondary" onClick={onCancel} disabled={isSaving} className="flex-1 rounded-2xl">
						Cancel
					</Button>
				) : null}
				<Button type="submit" size="lg" variant="brand" disabled={isSaving} aria-busy={isSaving} className="flex-1 rounded-2xl">
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>
		</fetcher.Form>
	);
}
