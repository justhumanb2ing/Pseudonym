import { ArrowCircleUpRightIcon } from "@phosphor-icons/react";
import type { StudioOutletContext } from "types/studio.types";
import { MapCanvas } from "@/components/map/map-canvas";
import { Item, ItemContent } from "@/components/ui/item";
import { cn } from "@/lib/utils";

type ProfileItem = StudioOutletContext["profileItems"][number];

interface MapItemProps {
	item: ProfileItem;
}

export default function MapItem({ item }: MapItemProps) {
	const config = item.config;
	const mapData = config?.data;
	const lat = mapData?.lat;
	const lng = mapData?.lng;
	const zoom = mapData?.zoom;
	const caption = mapData?.caption ?? "";
	const linkUrl = mapData?.url ?? "";
	const layout = config?.style?.layout ?? "compact";
	const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
	const center = hasCoordinates ? ([lng, lat] as [number, number]) : undefined;
	const mapZoom = Number.isFinite(zoom) ? zoom : undefined;

	return (
		<Item variant={"default"} className="p-0">
			<ItemContent className="min-w-0 flex-1">
				<div className="relative flex w-full flex-col gap-3">
					<div
						className={cn(
							"relative w-full overflow-hidden rounded-xl bg-muted/60 outline outline-border",
							layout === "compact" ? "aspect-video" : "aspect-square",
						)}
					>
						<MapCanvas center={center} zoom={mapZoom} interactive={false} className="h-full w-full" />
					</div>
					{caption ? (
						<p className="absolute bottom-2 left-2 line-clamp-2 w-fit max-w-[calc(100%-1rem)] break-all rounded-lg border bg-background px-2 py-1 text-left text-sm leading-5">
							{caption}
						</p>
					) : null}
					{linkUrl ? (
						<div className="absolute top-2 right-2">
							<div className="size-6 rounded-full border bg-white">
								<a href={linkUrl} target="_blank" rel="noreferrer" className="block">
									<ArrowCircleUpRightIcon weight="fill" className="size-full text-black" />
								</a>
							</div>
						</div>
					) : null}
				</div>
			</ItemContent>
		</Item>
	);
}
