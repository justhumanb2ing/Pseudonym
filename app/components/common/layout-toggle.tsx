import { DesktopIcon, DeviceMobileCameraIcon } from "@phosphor-icons/react";
import { isMobileWeb } from "@toss/utils";
import { useIntlayer } from "react-intlayer";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface LayoutToggleProps {
	isDesktop: boolean;
	onToggle: (layout: "desktop" | "mobile") => void;
}

const DESKTOP_VALUE = "desktop";
const MOBILE_VALUE = "mobile";

export default function LayoutToggle({ isDesktop, onToggle }: LayoutToggleProps) {
	const currentValue = isDesktop ? DESKTOP_VALUE : MOBILE_VALUE;
	const isMobileDevice = isMobileWeb();
	const { desktopTooltip, mobileTooltip } = useIntlayer("layoutToggle");

	if (isMobileDevice) return null;

	return (
		<div className="fixed right-4 bottom-4 z-50 hidden rounded-xl bg-background/40 p-1 shadow-sm backdrop-blur-sm sm:block">
			<ToggleGroup
				defaultValue={[currentValue]}
				onValueChange={(nextValue) => {
					if (nextValue.includes(DESKTOP_VALUE)) {
						onToggle("desktop");
						return;
					}

					if (nextValue.includes(MOBILE_VALUE)) {
						onToggle("mobile");
					}
				}}
				aria-label="Layout width"
				size={"lg"}
				spacing={2}
			>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger
							render={
								<ToggleGroupItem
									value={DESKTOP_VALUE}
									aria-label="Desktop width"
									disabled={isDesktop}
									className="rounded-lg p-5 disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-100 aria-pressed:bg-foreground aria-pressed:text-background"
								>
									<DesktopIcon weight="bold" className="size-6" />
								</ToggleGroupItem>
							}
						/>
						<TooltipContent>{desktopTooltip.value}</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger
							render={
								<ToggleGroupItem
									value={MOBILE_VALUE}
									aria-label="Mobile width"
									disabled={!isDesktop}
									className="rounded-lg p-5 disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-100 aria-pressed:bg-foreground aria-pressed:text-background"
								>
									<DeviceMobileCameraIcon weight="bold" className="size-6" />
								</ToggleGroupItem>
							}
						/>
						<TooltipContent>{mobileTooltip.value}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</ToggleGroup>
		</div>
	);
}
