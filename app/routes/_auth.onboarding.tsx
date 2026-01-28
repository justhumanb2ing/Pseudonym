import { CaretLeftIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher, useNavigate, useNavigation } from "react-router";
import { Activity } from "@/components/common/activity";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { Stepper, StepperIndicator, StepperItem, StepperTrigger } from "@/components/ui/stepper";
import type { OnboardingFormState } from "@/hooks/onboarding/onboarding-errors";
import { mapOnboardingActionErrors, useOnboardingErrors } from "@/hooks/onboarding/use-onboarding-errors";
import { useOnboardingTracking } from "@/hooks/onboarding/use-onboarding-tracking";
import { useHandleValidation } from "@/hooks/use-handle-validation";
import { useUmamiPageView } from "@/hooks/use-umami-page-view";
import { authClient } from "@/lib/auth.client";
import { auth } from "@/lib/auth.server";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import { CompleteStep, DetailsStep, HandleStep } from "@/routes/onboarding/onboarding-steps";
import { type ActionData, action } from "@/service/onboarding.action";
import type { Route } from "./+types/_auth.onboarding";

type StepId<T extends string = string> = T;
type Step = StepId<"handle" | "details" | "complete">;
type StepItem = { id: Step; label: string; value: number };

function getStepMeta(steps: Array<StepItem>, step: Step) {
	const activeStep = step === "handle" ? 1 : 2;
	const activeStepItem = steps.find((item) => item.id === step);
	const isCompleteStep = step === "complete";

	return { activeStep, activeStepItem, isCompleteStep };
}

export async function loader(args: Route.LoaderArgs) {
	const session = await auth.api.getSession({
		headers: args.request.headers,
	});
	console.log(session);
}
export default function OnboardingRoute() {
	const navigation = useNavigation();
	const navigate = useNavigate();
	const fetcher = useFetcher<ActionData>();
	const formRef = useRef<HTMLFormElement>(null);
	const isSubmitting = navigation.state !== "idle" || fetcher.state !== "idle";
	const actionData = fetcher.data;

	const defaultFormValues: OnboardingFormState = {
		handle: "",
		title: "",
		description: "",
	};

	const steps: Array<StepItem> = [
		{
			id: "handle",
			label: "Choose a unique handle",
			value: 1,
		},
		{ id: "details", label: "Fill out details", value: 2 },
	];
	const [step, setStep] = useState<Step>("handle");
	const { activeStep, activeStepItem, isCompleteStep } = getStepMeta(steps, step);
	const [completedHandle, setCompletedHandle] = useState<string | null>(null);
	const [direction, setDirection] = useState<1 | -1>(1);

	const { checkHandleAvailability, isChecking: isCheckingHandle } = useHandleValidation();

	const { trackSignupStart, trackSignupSubmit, trackSignupSuccess, trackSignupError } = useOnboardingTracking();

	useUmamiPageView({
		eventName: UMAMI_EVENTS.auth.signup.view,
		props: {
			[UMAMI_PROP_KEYS.ctx.pageKind]: "onboarding",
		},
	});

	const [formValues, setFormValues] = useState<OnboardingFormState>(defaultFormValues);
	const { formErrors, setFieldError, clearFieldError } = useOnboardingErrors();
	const { handle: handleValue, title, description } = formValues;
	const isDetailsComplete = title.trim().length > 0;
	const canSubmit = !!handleValue && isDetailsComplete;
	const rootError = formErrors.root;

	const getHandleError = useCallback((value: string) => {
		const normalized = value.trim().toLowerCase();
		if (!normalized) {
			return "Only lowercase letters and numbers are allowed.";
		}
		if (!/^[a-z0-9]+$/.test(normalized)) {
			return "Only lowercase letters and numbers are allowed.";
		}
		return undefined;
	}, []);

	const getTitleError = useCallback((value: string) => {
		return value.trim().length > 0 ? undefined : "Title is required.";
	}, []);

	const ensureHandleAvailable = useCallback(
		async (rawHandle: string) => {
			const result = await checkHandleAvailability(rawHandle.trim());

			if (!result.available) {
				setFieldError("handle", result.error ?? "Handle is not available.");
				return false;
			}

			return true;
		},
		[checkHandleAvailability, setFieldError],
	);

	const applyActionDataEffects = useCallback(
		(data: ActionData | undefined) => {
			if (!data) {
				return;
			}

			if (data.success && data.handle) {
				setCompletedHandle(data.handle);
				setDirection(1);
				setStep("complete");
				trackSignupSuccess(data.handle);
				return;
			}

			const mappedErrors = mapOnboardingActionErrors(data);

			if (mappedErrors.handle) {
				setFieldError("handle", mappedErrors.handle);
				setStep("handle");
			}

			if (mappedErrors.title) {
				setFieldError("title", mappedErrors.title);
			}

			if (mappedErrors.description) {
				setFieldError("description", mappedErrors.description);
			}

			if (mappedErrors.title || mappedErrors.description) {
				setStep("details");
			}

			if (mappedErrors.root) {
				setFieldError("root", mappedErrors.root);
			}

			if (data.formError || data.fieldErrors) {
				trackSignupError(step, data.formError ? "server" : "validation");
			}
		},
		[setFieldError, step, trackSignupError, trackSignupSuccess],
	);

	useEffect(() => {
		applyActionDataEffects(actionData);
	}, [actionData, applyActionDataEffects]);

	useEffect(() => {
		if (step === "handle") {
			clearFieldError("root");
		}
	}, [clearFieldError, step]);

	const handleAdvanceToDetails = async () => {
		if (isCheckingHandle) {
			return;
		}

		const nextHandle = formValues.handle;
		const handleError = getHandleError(nextHandle);
		if (handleError) {
			setFieldError("handle", handleError);
			return;
		}

		clearFieldError("handle");

		const isAvailable = await ensureHandleAvailable(nextHandle);
		if (!isAvailable) {
			return;
		}

		setDirection(1);
		setStep("details");
	};

	const submitForm = () => {
		if (!canSubmit) {
			return;
		}
		trackSignupSubmit(step);
		if (!formRef.current) {
			return;
		}
		fetcher.submit(formRef.current, { method: "post" });
	};

	const handleInputChange = (nextValue: string) => {
		setFormValues((prev) => ({
			...prev,
			handle: nextValue,
		}));
		const nextError = getHandleError(nextValue);
		if (nextError) {
			setFieldError("handle", nextError);
		} else {
			clearFieldError("handle");
		}
		clearFieldError("root");
		trackSignupStart("handle");
	};

	const titleInputChange = (nextValue: string) => {
		setFormValues((prev) => ({
			...prev,
			title: nextValue,
		}));
		const nextError = getTitleError(nextValue);
		if (nextError) {
			setFieldError("title", nextError);
		} else {
			clearFieldError("title");
		}
		clearFieldError("root");
		trackSignupStart("details");
	};

	const descriptionInputChange = (nextValue: string) => {
		setFormValues((prev) => ({
			...prev,
			description: nextValue,
		}));
		clearFieldError("description");
		clearFieldError("root");
		trackSignupStart("details");
	};

	const handleGoToPage = async () => {
		if (!completedHandle) {
			return;
		}
		// 세션 쿠키를 갱신하여 온보딩 가드를 통과할 수 있게 함
		await authClient.getSession({
			query: { disableCookieCache: true },
		});
		navigate(`/studio/${completedHandle}/links`);
	};

	return (
		<main className="container mx-auto max-w-lg grow px-8">
			<section className="h-80 space-y-4">
				{isCompleteStep ? null : (
					<Stepper
						value={activeStep}
						onValueChange={(value) => {
							if (value === 1) {
								setDirection(-1);
								setStep("handle");
								return;
							}

							if (value === 2 && handleValue) {
								setDirection(1);
								setStep("details");
							}
						}}
					>
						{steps.map((stepItem) => (
							<StepperItem className="flex-1" key={stepItem.id} step={stepItem.value}>
								<StepperTrigger
									aria-current={stepItem.id === step ? "step" : undefined}
									asChild
									className="w-full flex-col items-start gap-2"
								>
									<StepperIndicator asChild className="h-1 w-full rounded-none bg-border">
										<span className="sr-only">{step}</span>
									</StepperIndicator>
								</StepperTrigger>
							</StepperItem>
						))}
					</Stepper>
				)}
				<div className="flex gap-2">
					{isCompleteStep ? null : (
						<Button
							type="button"
							size={"icon-lg"}
							variant={"ghost"}
							onClick={() => {
								setDirection(-1);
								setStep("handle");
							}}
							disabled={activeStep === 1}
							className={"mt-2 size-10"}
						>
							<CaretLeftIcon weight="bold" className="size-7" />
						</Button>
					)}
					<fetcher.Form
						ref={formRef}
						className="grow"
						method="post"
						onSubmit={(event) => {
							if (step === "handle") {
								event.preventDefault();
								void handleAdvanceToDetails();
								return;
							}
							event.preventDefault();
							void submitForm();
						}}
					>
						<input type="hidden" name="handle" value={handleValue} />
						{isCompleteStep ? null : (
							<aside className="mb-4">
								<div className="font-medium text-muted-foreground tabular-nums">
									Step {activeStep} of {steps.length}
								</div>
								<div className="font-medium text-foreground">{activeStepItem?.label}</div>
							</aside>
						)}
						<FieldSet>
							<Activity activeKey={step} direction={direction}>
								{step === "handle" ? (
									<HandleStep
										handleValue={handleValue}
										errors={{ handle: formErrors.handle }}
										isCheckingHandle={isCheckingHandle}
										onHandleChange={handleInputChange}
										onNext={() => void handleAdvanceToDetails()}
									/>
								) : step === "details" ? (
									<DetailsStep
										title={title}
										description={description ?? undefined}
										errors={{
											title: formErrors.title,
											description: formErrors.description,
											root: rootError,
										}}
										isSubmitting={isSubmitting}
										canSubmit={canSubmit}
										onTitleChange={titleInputChange}
										onDescriptionChange={descriptionInputChange}
									/>
								) : (
									<CompleteStep completedHandle={completedHandle} onGoToPage={handleGoToPage} />
								)}
							</Activity>
						</FieldSet>
					</fetcher.Form>
				</div>
			</section>
		</main>
	);
}

export { action };
