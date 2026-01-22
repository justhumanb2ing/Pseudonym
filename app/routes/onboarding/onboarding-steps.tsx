import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toErrorItems } from "@/hooks/onboarding/onboarding-errors";
import { cn } from "@/lib/utils";

type HandleStepProps = {
	handleValue: string;
	errors: { handle?: string };
	isCheckingHandle: boolean;
	onHandleChange: (nextValue: string) => void;
	onNext: () => void;
};

function HandleStep({ handleValue, errors, isCheckingHandle, onHandleChange, onNext }: HandleStepProps) {
	const handleError = errors.handle;

	return (
		<div className="flex flex-col gap-4">
			<Field className="mt-4">
				<FieldLabel className="sr-only" htmlFor="handle">
					Handle
				</FieldLabel>
				<FieldContent>
					<div className="relative">
						<Input
							id="handle"
							name="handle"
							autoCapitalize="none"
							autoComplete="off"
							autoFocus
							placeholder="Your handle"
							value={handleValue}
							onChange={(event) => onHandleChange(event.target.value)}
							aria-invalid={!!handleError}
							aria-describedby={handleError ? "handle-description handle-error" : "handle-description"}
							className={cn("peer h-12 rounded-xl border-none ps-28.5 text-base!")}
						/>
						{/* TODO: 도메인 구매 후, 실제 도메인 표시 */}
						<span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-base! text-muted-foreground peer-disabled:opacity-50">
							@
						</span>
					</div>
					<FieldError id="handle-error" errors={toErrorItems(handleError)} />
				</FieldContent>
			</Field>
			<Button
				type="button"
				size="lg"
				variant={"brand"}
				className={"h-11 rounded-xl text-base"}
				onClick={onNext}
				disabled={!handleValue || isCheckingHandle || !!handleError}
				aria-busy={isCheckingHandle}
			>
				Next
			</Button>
		</div>
	);
}

type DetailsStepProps = {
	title: string;
	description: string | undefined;
	errors: { title?: string; description?: string; root?: string };
	isSubmitting: boolean;
	canSubmit: boolean;
	onTitleChange: (nextValue: string) => void;
	onDescriptionChange: (nextValue: string) => void;
};

function DetailsStep({ title, description, errors, isSubmitting, canSubmit, onTitleChange, onDescriptionChange }: DetailsStepProps) {
	const titleError = errors.title;
	const descriptionError = errors.description;
	const rootError = errors.root;

	return (
		<div className="flex flex-col gap-4">
			<Field className="relative mt-4 gap-1 rounded-xl border border-input bg-input/20 outline-none transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-aria-invalid:border-destructive has-disabled:opacity-50 has-aria-invalid:ring-destructive/20 has-[input:is(:disabled)]:*:pointer-events-none dark:has-aria-invalid:ring-destructive/40">
				<FieldLabel className="flex gap-1 px-3 pt-2 font-medium text-foreground text-sm" htmlFor="title">
					Title<span className="text-destructive">*</span>
				</FieldLabel>
				<FieldContent>
					<Input
						id="title"
						name="title"
						autoCapitalize="sentences"
						autoFocus
						autoComplete="off"
						placeholder="Your page title"
						value={title}
						onChange={(event) => onTitleChange(event.target.value)}
						aria-invalid={!!titleError}
						aria-describedby={titleError ? "title-error" : undefined}
						className="h-10 rounded-xl border-none bg-transparent px-3 ps-4 pb-2 text-base! focus-visible:ring-0 aria-invalid:ring-0 dark:aria-invalid:ring-0"
					/>
					<FieldError id="title-error" className="mb-2 ml-4" errors={toErrorItems(titleError)} />
				</FieldContent>
			</Field>
			<Field className="relative mt-4 gap-1 rounded-xl border border-input bg-input/20 outline-none transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-aria-invalid:border-destructive has-disabled:opacity-50 has-aria-invalid:ring-destructive/20 has-[input:is(:disabled)]:*:pointer-events-none dark:has-aria-invalid:ring-destructive/40">
				<FieldLabel className="block px-3 pt-2 font-medium text-foreground text-sm" htmlFor="description">
					Bio
				</FieldLabel>
				<FieldContent>
					<Textarea
						id="description"
						name="description"
						autoComplete="off"
						placeholder="Tell people about your page"
						value={description}
						onChange={(event) => onDescriptionChange(event.target.value)}
						aria-invalid={!!descriptionError}
						aria-describedby={descriptionError ? "description-error" : undefined}
						className="h-24 rounded-xl border-none bg-transparent ps-4 text-base! focus-visible:ring-0"
					/>
					<FieldError id="description-error" errors={toErrorItems(descriptionError)} />
				</FieldContent>
			</Field>
			{rootError ? (
				<p className="text-destructive text-sm" role="alert">
					{rootError}
				</p>
			) : null}
			<div className="flex items-center gap-2">
				<Button
					className={"h-11 w-full rounded-xl text-base"}
					size={"lg"}
					type="submit"
					variant={"brand"}
					disabled={isSubmitting || !canSubmit}
					aria-busy={isSubmitting}
					data-icon={isSubmitting ? "inline-start" : undefined}
				>
					{isSubmitting ? <Spinner /> : "Complete"}
				</Button>
			</div>
		</div>
	);
}

type CompleteStepProps = {
	completedHandle: string | null;
	onGoToPage: () => void;
};

function CompleteStep({ completedHandle, onGoToPage }: CompleteStepProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="font-semibold text-3xl">You&apos;re all set.</div>
			<p className="mb-4 ml-1 text-base text-muted-foreground">Your page is ready. You can visit it now.</p>
			<Button
				type="button"
				size="lg"
				variant="brand"
				className="h-11 rounded-xl text-base"
				onClick={onGoToPage}
				disabled={!completedHandle}
			>
				Go to Page
			</Button>
		</div>
	);
}

export { HandleStep, DetailsStep, CompleteStep };
