import { LoaderIcon } from "lucide-react";
import { useFetcher } from "react-router";
import { Button } from "@/components/ui/button";
import type { ActionData } from "@/routes/($lang).studio.$handle.links";

type PageVisibilityToggleProps = {
	pageId: string;
	isPublic: boolean;
};

export default function PageVisibilityToggle({ pageId, isPublic }: PageVisibilityToggleProps) {
	const fetcher = useFetcher<ActionData>();
	const isSubmitting = fetcher.state !== "idle";

	return (
		<div className="flex flex-col">
			<h2 className="font-jalnan-gothic text-lg">{isPublic ? "Public" : "Private"}</h2>
			<h3 className="text-muted-foreground text-sm/relaxed">{isPublic ? "Anyone can view this page" : "Only you can view this page"}</h3>
			<fetcher.Form method="post" className="flex justify-end">
				<input type="hidden" name="intent" value="page-visibility" />
				<input type="hidden" name="pageId" value={pageId} />
				<input type="hidden" name="isPublic" value={String(isPublic)} />
				<Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="gap-2">
					{isSubmitting && <LoaderIcon aria-hidden="true" className="size-4 animate-spin" />}
					Change
				</Button>
			</fetcher.Form>
		</div>
	);
}
