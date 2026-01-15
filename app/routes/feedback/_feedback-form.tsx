import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { FetcherWithComponents } from "react-router";
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
    <main className="h-full container mx-auto max-w-2xl flex flex-col gap-6 p-8">
      <header className="font-medium text-xl">
        Report an issue or share product feedback.
      </header>
      <section className="grow flex flex-col relative">
        <fetcher.Form
          method="post"
          noValidate
          className="w-full max-w-full flex flex-col gap-6"
        >
          {formError ? (
            <p className="text-destructive text-sm" role="alert">
              {formError}
            </p>
          ) : null}
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
                    aria-describedby={
                      fieldErrors?.senderEmail ? "senderEmail-error" : undefined
                    }
                  />
                  <FieldError
                    id="senderEmail-error"
                    errors={senderEmailErrors}
                  />
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
                  aria-describedby={
                    fieldErrors?.subject ? "subject-error" : undefined
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
                  className="min-h-32"
                  aria-invalid={!!fieldErrors?.content}
                  aria-describedby={
                    fieldErrors?.content ? "content-error" : undefined
                  }
                />
                <FieldError id="content-error" errors={contentErrors} />
              </FieldContent>
            </Field>
          </FieldSet>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs/relaxed text-muted-foreground">
              Responses are not guaranteed.
            </p>
            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="min-w-32"
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
          </div>
        </fetcher.Form>
        <div className="absolute top-0 left-0 h-full w-full bg-muted/50 flex items-center justify-center font-medium text-xs/relaxed">
          Unavailable
        </div>
      </section>
    </main>
  );
}
