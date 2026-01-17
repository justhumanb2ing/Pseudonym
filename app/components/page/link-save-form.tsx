import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { shouldShowUrlRequiredError } from "@/utils/link-save-form.utils";

type LinkSaveActionData = {
	fieldErrors?: {
		url?: string;
	};
	formError?: string;
	success?: boolean;
	intent?: "link-save";
};

type LinkSaveFormProps = {
	pageId: string;
	onSuccess?: () => void;
	onCancel?: () => void;
};

export default function LinkSaveForm({ pageId, onSuccess, onCancel }: LinkSaveFormProps) {
	const fetcher = useFetcher();
	const actionData = fetcher.data as LinkSaveActionData | undefined;
	const [urlValue, setUrlValue] = useState("");
	const [hasInteracted, setHasInteracted] = useState(false);

	const urlError = actionData?.fieldErrors?.url;
	const formError = actionData?.formError;
	const isSaving = fetcher.state !== "idle";
	const isUrlMissing = urlValue.trim().length === 0;
	const showRequiredError = shouldShowUrlRequiredError(hasInteracted, urlValue);
	const urlErrorMessage = showRequiredError ? "URL is required." : undefined;

	useEffect(() => {
		if (actionData?.success && actionData.intent === "link-save") {
			setUrlValue("");
			setHasInteracted(false);
			onSuccess?.();
		}
	}, [actionData?.success, actionData?.intent, onSuccess]);

	return (
		<fetcher.Form method="post" className="flex flex-col gap-3" noValidate>
			<input type="hidden" name="intent" value="link-save" />
			<input type="hidden" name="pageId" value={pageId} />
			<Field data-invalid={showRequiredError || !!urlError}>
				<FieldContent>
					<div className="relative">
						<FieldLabel htmlFor="link-url" className="pointer-events-none absolute top-2 left-3 text-muted-foreground text-sm">
							Link URL
						</FieldLabel>
						<Input
							id="link-url"
							name="url"
							value={urlValue}
							autoComplete="off"
							onChange={(event) => setUrlValue(event.target.value)}
							onBlur={() => setHasInteracted(true)}
							placeholder="example.com"
							disabled={isSaving}
							aria-invalid={showRequiredError || !!urlError}
							aria-describedby={urlError ? "link-url-error" : undefined}
							className="h-16 rounded-lg px-3 pt-8"
						/>
					</div>
					<FieldError id="link-url-error" errors={urlError || urlErrorMessage ? [{ message: urlError ?? urlErrorMessage ?? "" }] : []} />
				</FieldContent>
			</Field>
			{formError ? (
				<p className="text-destructive text-xs/relaxed" role="alert">
					{formError}
				</p>
			) : null}
			<div className="flex gap-2">
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel} disabled={isSaving} className="flex-1">
						Cancel
					</Button>
				)}
				<Button type="submit" disabled={isSaving || isUrlMissing} aria-busy={isSaving} className="flex-1">
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>
		</fetcher.Form>
	);
}
