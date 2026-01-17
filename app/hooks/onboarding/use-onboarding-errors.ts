import { useCallback, useState } from "react";
import type { OnboardingFormErrorKey, OnboardingFormErrors } from "@/hooks/onboarding/onboarding-errors";
import type { ActionData } from "@/service/onboarding.action";

export function mapOnboardingActionErrors(actionData: ActionData | undefined): OnboardingFormErrors {
	if (!actionData) {
		return {};
	}

	const errors: OnboardingFormErrors = {};

	if (actionData.fieldErrors?.handle) {
		errors.handle = actionData.fieldErrors.handle;
	}
	if (actionData.fieldErrors?.title) {
		errors.title = actionData.fieldErrors.title;
	}
	if (actionData.fieldErrors?.description) {
		errors.description = actionData.fieldErrors.description;
	}
	if (actionData.formError) {
		errors.root = actionData.formError;
	}

	return errors;
}

export function useOnboardingErrors() {
	const [formErrors, setFormErrors] = useState<OnboardingFormErrors>({});

	const setFieldError = useCallback((field: OnboardingFormErrorKey, message: string) => {
		setFormErrors((prev) => ({ ...prev, [field]: message }));
	}, []);

	const clearFieldError = useCallback((field: OnboardingFormErrorKey) => {
		setFormErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
	}, []);

	return {
		formErrors,
		setFieldError,
		clearFieldError,
	};
}
