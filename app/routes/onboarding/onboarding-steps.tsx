import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toErrorItems } from "@/hooks/onboarding/onboarding-errors";

type HandleStepProps = {
  handleValue: string;
  errors: { handle?: string };
  isCheckingHandle: boolean;
  onHandleChange: (nextValue: string) => void;
  onNext: () => void;
};

function HandleStep({
  handleValue,
  errors,
  isCheckingHandle,
  onHandleChange,
  onNext,
}: HandleStepProps) {
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
              aria-describedby={
                handleError
                  ? "handle-description handle-error"
                  : "handle-description"
              }
              className={cn(
                "peer ps-28.5 border-none h-12 text-base! rounded-xl"
              )}
            />
            {/* TODO: 도메인 구매 후, 실제 도메인 표시 */}
            <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground text-base! peer-disabled:opacity-50">
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
        className={"h-11 text-base rounded-xl"}
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

function DetailsStep({
  title,
  description,
  errors,
  isSubmitting,
  canSubmit,
  onTitleChange,
  onDescriptionChange,
}: DetailsStepProps) {
  const titleError = errors.title;
  const descriptionError = errors.description;
  const rootError = errors.root;

  return (
    <div className="flex flex-col gap-4">
      <Field className="mt-4 relative rounded-xl border border-input bg-input/20 outline-none transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-aria-invalid:border-destructive has-disabled:opacity-50 has-aria-invalid:ring-destructive/20 has-[input:is(:disabled)]:*:pointer-events-none dark:has-aria-invalid:ring-destructive/40">
        <FieldLabel
          className="block px-3 pt-2 text-sm text-foreground font-medium"
          htmlFor="title"
        >
          Title
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
            className="px-3 pb-2 ps-4 h-12 text-base! rounded-xl bg-transparent border-none focus-visible:ring-0 aria-invalid:ring-0 dark:aria-invalid:ring-0"
          />
          <FieldError
            id="title-error"
            className="ml-4 mb-2"
            errors={toErrorItems(titleError)}
          />
        </FieldContent>
      </Field>
      <Field className="mt-4 relative rounded-xl border border-input bg-input/20 outline-none transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-aria-invalid:border-destructive has-disabled:opacity-50 has-aria-invalid:ring-destructive/20 has-[input:is(:disabled)]:*:pointer-events-none dark:has-aria-invalid:ring-destructive/40">
        <FieldLabel
          className="block px-3 pt-2 text-sm text-foreground font-medium"
          htmlFor="description"
        >
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
            aria-describedby={
              descriptionError ? "description-error" : undefined
            }
            className="h-24 text-base! rounded-xl ps-4 bg-transparent border-none focus-visible:ring-0"
          />
          <FieldError
            id="description-error"
            errors={toErrorItems(descriptionError)}
          />
        </FieldContent>
      </Field>
      {rootError ? (
        <p className="text-destructive text-sm" role="alert">
          {rootError}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <Button
          className={"w-full h-11 text-base rounded-xl"}
          size={"lg"}
          type="submit"
          variant={"brand"}
          disabled={isSubmitting || !canSubmit}
          aria-busy={isSubmitting}
          data-icon={isSubmitting ? "inline-start" : undefined}
        >
          {isSubmitting ? (
            <>
              <Spinner />
            </>
          ) : (
            "Complete"
          )}
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
      <div className="text-3xl font-semibold">You&apos;re all set.</div>
      <p className="ml-1 text-base text-muted-foreground mb-4">
        Your page is ready. You can visit it now.
      </p>
      <Button
        type="button"
        size="lg"
        variant="brand"
        className="h-11 text-base rounded-xl"
        onClick={onGoToPage}
        disabled={!completedHandle}
      >
        Go to Page
      </Button>
    </div>
  );
}

export { HandleStep, DetailsStep, CompleteStep };
