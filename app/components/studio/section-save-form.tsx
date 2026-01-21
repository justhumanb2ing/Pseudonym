import { type ChangeEvent, useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const MAX_HEADLINE_LENGTH = 50;

type SectionSaveActionData = {
	fieldErrors?: {
		headline?: string;
	};
	formError?: string;
	success?: boolean;
	intent?: "section-save";
};

type SectionSaveFormProps = {
	pageId: string;
	onSuccess?: () => void;
	onCancel?: () => void;
};

export default function SectionSaveForm({ pageId, onSuccess, onCancel }: SectionSaveFormProps) {
	const fetcher = useFetcher<SectionSaveActionData>();
	const actionData = fetcher.data;
	const [headlineValue, setHeadlineValue] = useState("");
	const [hasInteracted, setHasInteracted] = useState(false);

	const headlineError = actionData?.fieldErrors?.headline;
	const formError = actionData?.formError;
	const isSaving = fetcher.state !== "idle";
	const headlineLength = headlineValue.length;
	const isHeadlineMissing = headlineValue.trim().length === 0;
	const isHeadlineTooLong = headlineLength > MAX_HEADLINE_LENGTH;
	const showRequiredError = hasInteracted && isHeadlineMissing;
	const headlineErrorMessage = showRequiredError
		? "Headline is required."
		: isHeadlineTooLong
			? `Headline must be ${MAX_HEADLINE_LENGTH} characters or less.`
			: undefined;

	useEffect(() => {
		if (actionData?.success && actionData.intent === "section-save") {
			setHeadlineValue("");
			setHasInteracted(false);
			onSuccess?.();
		}
	}, [actionData?.success, actionData?.intent, onSuccess]);

	const handleHeadlineChange = (event: ChangeEvent<HTMLInputElement>) => {
		const nextValue = event.target.value.slice(0, MAX_HEADLINE_LENGTH);
		setHeadlineValue(nextValue);
	};

	return (
		<fetcher.Form method="post" className="flex flex-col justify-between gap-3" noValidate>
			<input type="hidden" name="intent" value="section-save" />
			<input type="hidden" name="pageId" value={pageId} />
			<Field data-invalid={showRequiredError || !!headlineError || isHeadlineTooLong}>
				<FieldContent>
					<div className="relative px-2">
						<Input
							id="section-headline"
							name="headline"
							value={headlineValue}
							autoFocus
							autoComplete="off"
							aria-label="Section headline"
							onChange={handleHeadlineChange}
							onBlur={() => setHasInteracted(true)}
							placeholder="Section..."
							maxLength={MAX_HEADLINE_LENGTH}
							disabled={isSaving}
							aria-invalid={showRequiredError || !!headlineError || isHeadlineTooLong}
							aria-describedby={headlineError ? "section-headline-error" : undefined}
							className="h-12 rounded-none border-0 border-brand/60 border-b-2 bg-transparent text-sm shadow-none focus-visible:border-brand focus-visible:ring-0 aria-invalid:ring-0"
						/>
					</div>
					<div className="mt-1 flex items-center justify-between px-2">
						<FieldError
							id="section-headline-error"
							className="text-xs/relaxed"
							errors={headlineError || headlineErrorMessage ? [{ message: headlineError ?? headlineErrorMessage ?? "" }] : []}
						/>
						<p className="text-right text-muted-foreground text-xs">
							{headlineLength}/{MAX_HEADLINE_LENGTH}
						</p>
					</div>
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
					disabled={isSaving || isHeadlineMissing || isHeadlineTooLong}
					aria-busy={isSaving}
					className="flex-1 rounded-2xl"
				>
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>
		</fetcher.Form>
	);
}
