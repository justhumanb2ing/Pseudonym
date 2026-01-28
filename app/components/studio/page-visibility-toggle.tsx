import { LoaderIcon } from "lucide-react";
import { useFetcher } from "react-router";
import { Button } from "@/components/ui/button";
import type { ActionData } from "@/routes/studio.$handle.links";

type PageVisibilityToggleProps = {
	pageId: string;
	isPublic: boolean;
	actionUrl: string;
};

export default function PageVisibilityToggle({ pageId, isPublic, actionUrl }: PageVisibilityToggleProps) {
	const fetcher = useFetcher<ActionData>();
	const isSubmitting = fetcher.state !== "idle";
	const title = isPublic ? "Public" : "Private";
	const description = isPublic ? "Anyone can view this page" : "Only you can view this page";
	const buttonLabel = isPublic ? "Change to private" : "Change to public";

	return (
		<div className="flex flex-col items-center justify-between gap-0 rounded-2xl bg-card">
			<div className="flex w-full items-center gap-3 p-4">
				{/* Text */}
				<div className="flex flex-col">
					<span className="font-semibold text-base text-foreground uppercase">{title}</span>
					<span className="text-[13px] text-muted-foreground">{description}</span>
				</div>
			</div>

			<fetcher.Form method="post" action={actionUrl} className="w-full p-2">
				<input type="hidden" name="intent" value="page-visibility" />
				<input type="hidden" name="pageId" value={pageId} />
				<input type="hidden" name="isPublic" value={String(isPublic)} />
				<Button
					type="submit"
					variant="brand"
					disabled={isSubmitting}
					aria-busy={isSubmitting}
					className="w-full rounded-xl font-medium text-sm transition-all duration-150 active:scale-95"
				>
					{isSubmitting ? <LoaderIcon aria-hidden="true" className="size-4 animate-spin" /> : <span>{buttonLabel}</span>}
				</Button>
			</fetcher.Form>
		</div>
	);
}
