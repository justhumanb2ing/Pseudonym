import type { FetcherWithComponents } from "react-router";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { ActionData, FieldErrors } from "@/service/feedback.action";

type FeedbackFormProps = {
	fetcher: FetcherWithComponents<ActionData>;
	isSubmitting: boolean;
	fieldErrors: FieldErrors | undefined;
	formError: string | undefined;
	senderEmailErrors: Array<{ message: string }> | undefined;
	subjectErrors: Array<{ message: string }> | undefined;
	contentErrors: Array<{ message: string }> | undefined;
};

export default function FeedbackForm({
	fetcher,
	isSubmitting,
	fieldErrors,
	formError,
	senderEmailErrors,
	subjectErrors,
	contentErrors,
}: FeedbackFormProps) {
	return (
		<section className="relative flex flex-col">
			<fetcher.Form method="post" noValidate className="flex w-full max-w-full flex-col gap-6">
				{formError ? (
					<p className="text-destructive text-sm" role="alert">
						{formError}
					</p>
				) : null}
				<FieldGroup>
					<FieldSet className="gap-5">
						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="senderEmail">Email (optional)</FieldLabel>
								<FieldContent>
									<Input
										id="senderEmail"
										name="senderEmail"
										type="email"
										autoComplete="off"
										placeholder="Enter your email only if you’d like a reply."
										aria-invalid={!!fieldErrors?.senderEmail}
										aria-describedby={fieldErrors?.senderEmail ? "senderEmail-error" : undefined}
										className={
											"rounded-none border-0 border-brand/80 border-b bg-background shadow-none focus-visible:border-brand focus-visible:ring-0 aria-invalid:ring-0"
										}
									/>
									<FieldError id="senderEmail-error" errors={senderEmailErrors} />
								</FieldContent>
							</Field>
						</div>
						<Field>
							<FieldLabel htmlFor="subject" className="gap-1">
								Subject<span className="text-destructive">*</span>
							</FieldLabel>
							<FieldContent>
								<Input
									id="subject"
									name="subject"
									autoComplete="off"
									placeholder="Brief summary"
									aria-invalid={!!fieldErrors?.subject}
									aria-describedby={fieldErrors?.subject ? "subject-error" : undefined}
									className={
										"rounded-none border-0 border-brand/80 border-b bg-background shadow-none focus-visible:border-brand focus-visible:ring-0 aria-invalid:ring-0"
									}
								/>
								<FieldError id="subject-error" errors={subjectErrors} />
							</FieldContent>
						</Field>
						<Field>
							<FieldLabel htmlFor="content" className="gap-1">
								Message<span className="text-destructive">*</span>
							</FieldLabel>
							<FieldContent>
								<Textarea
									id="content"
									name="content"
									autoComplete="off"
									placeholder="Tell us what happened or what you would love to see."
									aria-invalid={!!fieldErrors?.content}
									aria-describedby={fieldErrors?.content ? "content-error" : undefined}
									className={
										"min-h-32 rounded-none border-0 border-brand/80 border-b bg-background shadow-none focus-visible:border-brand focus-visible:ring-0 aria-invalid:ring-0"
									}
								/>
								<FieldError id="content-error" errors={contentErrors} />
							</FieldContent>
						</Field>
					</FieldSet>
				</FieldGroup>
				<div className="flex flex-col items-center gap-3">
					<Button
						type="submit"
						variant="brand"
						size="lg"
						className="w-full"
						disabled={isSubmitting}
						aria-busy={isSubmitting}
						data-icon={isSubmitting ? "inline-start" : undefined}
					>
						{isSubmitting ? (
							<>
								<Spinner />
								Sending...
							</>
						) : (
							"Send feedback"
						)}
					</Button>
					<p className="text-muted-foreground text-xs/relaxed">Responses are not guaranteed.</p>
				</div>
			</fetcher.Form>
			<div className="absolute top-0 left-0 flex h-full w-full items-center justify-center bg-muted/50 font-medium text-xs/relaxed">
				Unavailable
			</div>
		</section>
	);
}
