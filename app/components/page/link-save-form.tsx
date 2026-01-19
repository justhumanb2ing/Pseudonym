import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
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
	const fetcher = useFetcher<LinkSaveActionData>();
	const actionData = fetcher.data;
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
		<fetcher.Form method="post" className="flex flex-col justify-between gap-3" noValidate>
			<input type="hidden" name="intent" value="link-save" />
			<input type="hidden" name="pageId" value={pageId} />
			<Field data-invalid={showRequiredError || !!urlError}>
				<FieldContent>
					<div className="relative px-2">
						<Input
							id="link-url"
							name="url"
							value={urlValue}
							autoComplete="off"
							aria-label="Link URL"
							onChange={(event) => setUrlValue(event.target.value)}
							onBlur={() => setHasInteracted(true)}
							placeholder="Link..."
							disabled={isSaving}
							aria-invalid={showRequiredError || !!urlError}
							aria-describedby={urlError ? "link-url-error" : undefined}
							className="h-12 rounded-none border-0 border-brand/60 border-b-2 bg-transparent text-sm shadow-none focus-visible:border-brand focus-visible:ring-0 aria-invalid:ring-0"
						/>
					</div>
					<FieldError
						id="link-url-error"
						className="mt-1 text-xs/relaxed"
						errors={urlError || urlErrorMessage ? [{ message: urlError ?? urlErrorMessage ?? "" }] : []}
					/>
				</FieldContent>
			</Field>
			{formError ? (
				<p className="text-destructive text-xs/relaxed" role="alert">
					{formError}
				</p>
			) : null}
			<div className="flex gap-2">
				{onCancel && (
					<Button type="button" size={"lg"} variant="secondary" onClick={onCancel} disabled={isSaving} className="flex-1 rounded-2xl">
						Cancel
					</Button>
				)}
				<Button
					type="submit"
					size={"lg"}
					variant={"brand"}
					disabled={isSaving || isUrlMissing}
					aria-busy={isSaving}
					className="flex-1 rounded-2xl"
				>
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>
		</fetcher.Form>
	);
}
