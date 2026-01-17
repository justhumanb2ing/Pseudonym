import type { OnboardingFormValues } from "@/service/onboarding.action";

export type OnboardingFormState = Pick<OnboardingFormValues, "handle" | "title" | "description">;

export type OnboardingFormErrorKey = keyof OnboardingFormState | "root";
export type OnboardingFormErrors = Partial<Record<OnboardingFormErrorKey, string>>;

export type OnboardingErrorItem = { message: string };

export function toErrorItems(error?: string): Array<OnboardingErrorItem> | undefined {
	return error ? [{ message: error }] : undefined;
}
