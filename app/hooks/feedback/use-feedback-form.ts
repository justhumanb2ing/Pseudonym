import { useFetcher } from "react-router";

import type { ActionData } from "@/service/feedback.action";

export function useFeedbackForm() {
	const fetcher = useFetcher<ActionData>();
	const isSubmitting = fetcher.state !== "idle";
	const actionData = fetcher.state === "idle" ? fetcher.data : undefined;
	const fieldErrors = actionData?.ok === false ? actionData.fieldErrors : undefined;
	const formError = actionData?.ok === false ? actionData.formError : undefined;
	const senderEmailErrors = fieldErrors?.senderEmail ? [{ message: fieldErrors.senderEmail }] : undefined;
	const subjectErrors = fieldErrors?.subject ? [{ message: fieldErrors.subject }] : undefined;
	const contentErrors = fieldErrors?.content ? [{ message: fieldErrors.content }] : undefined;

	return {
		fetcher,
		isSubmitting,
		actionData,
		fieldErrors,
		formError,
		senderEmailErrors,
		subjectErrors,
		contentErrors,
	};
}
