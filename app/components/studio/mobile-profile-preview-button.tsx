import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetDescription, SheetHeader, SheetPanel, SheetPopup, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIframePreview } from "@/hooks/use-iframe-preview";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlowEffect } from "../effects/glow-effect";

import ProfilePreviewFrame from "./profile-preview-frame";

interface MobileProfilePreviewButtonProps {
	handle: string;
	lang?: string;
}

export default function MobileProfilePreviewButton({ handle, lang }: MobileProfilePreviewButtonProps) {
	const isMobile = useIsMobile(1280);
	const previewFrameRef = useRef<HTMLIFrameElement>(null);

	const { handleIframeLoad } = useIframePreview({
		iframeRef: previewFrameRef,
	});

	if (!isMobile) return;

	return (
		<Sheet>
			<SheetTrigger
				render={
					<div className="relative flex-1 basis-0">
						<GlowEffect colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]} mode="colorShift" blur="soft" duration={3} scale={0.9} />
						<Button type="button" variant={"default"} size={"lg"} className="relative w-full dark:bg-foreground">
							Preview
						</Button>
					</div>
				}
			></SheetTrigger>
			<SheetPopup side="bottom">
				<SheetHeader hidden>
					<SheetTitle hidden></SheetTitle>
					<SheetDescription hidden></SheetDescription>
				</SheetHeader>
				<SheetPanel
					scrollFade
					scrollbarHidden
					className="h-dvh px-0 in-[[data-slot=sheet-popup]:has([data-slot=sheet-header])]:pt-0 in-[[data-slot=sheet-popup]:not(:has([data-slot=sheet-footer]))]:pb-0!"
				>
					<ProfilePreviewFrame
						iframeRef={previewFrameRef}
						handle={handle}
						lang={lang}
						className="h-full w-full"
						onLoad={handleIframeLoad}
					/>
				</SheetPanel>
			</SheetPopup>
		</Sheet>
	);
}
