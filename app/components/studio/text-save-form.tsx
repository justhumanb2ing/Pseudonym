import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type TextSaveActionData = {
	fieldErrors?: {
		title?: string;
	};
	formError?: string;
	success?: boolean;
	intent?: "text-save";
};

type TextSaveFormProps = {
	pageId: string;
	onSuccess?: () => void;
	onCancel?: () => void;
};

export default function TextSaveForm({ pageId, onSuccess, onCancel }: TextSaveFormProps) {
	const fetcher = useFetcher<TextSaveActionData>();
	const actionData = fetcher.data;
	const [titleValue, setTitleValue] = useState("");
	const [hasInteracted, setHasInteracted] = useState(false);

	const titleError = actionData?.fieldErrors?.title;
	const formError = actionData?.formError;
	const isSaving = fetcher.state !== "idle";
	const isTitleMissing = titleValue.trim().length === 0;
	const showRequiredError = hasInteracted && isTitleMissing;
	const titleErrorMessage = showRequiredError ? "Text is required." : undefined;

	useEffect(() => {
		if (actionData?.success && actionData.intent === "text-save") {
			setTitleValue("");
			setHasInteracted(false);
			onSuccess?.();
		}
	}, [actionData?.success, actionData?.intent, onSuccess]);

	return (
		<fetcher.Form method="post" className="flex flex-col justify-between gap-3" noValidate>
			<input type="hidden" name="intent" value="text-save" />
			<input type="hidden" name="pageId" value={pageId} />
			<Field data-invalid={showRequiredError || !!titleError}>
				<FieldContent>
					<div className="relative px-2">
						<Textarea
							id="text-title"
							name="title"
							value={titleValue}
							autoFocus
							autoComplete="off"
							aria-label="Text content"
							onChange={(event) => setTitleValue(event.target.value)}
							onBlur={() => setHasInteracted(true)}
							placeholder="Text..."
							disabled={isSaving}
							aria-invalid={showRequiredError || !!titleError}
							aria-describedby={titleError ? "text-title-error" : undefined}
							className="max-h-40 overflow-y-auto rounded-none border-0 border-brand/60 border-b-2 bg-transparent text-sm shadow-none focus-visible:border-brand focus-visible:ring-0 aria-invalid:ring-0"
						/>
					</div>
					<FieldError
						id="text-title-error"
						className="mt-1 text-xs/relaxed"
						errors={titleError || titleErrorMessage ? [{ message: titleError ?? titleErrorMessage ?? "" }] : []}
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
					disabled={isSaving || isTitleMissing}
					aria-busy={isSaving}
					className="flex-1 rounded-2xl"
				>
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>
		</fetcher.Form>
	);
}
