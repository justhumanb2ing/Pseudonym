import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { shouldShowUrlRequiredError } from "@/components/page/link-save-form.utils";

type LinkSaveActionData = {
  fieldErrors?: {
    url?: string;
  };
  formError?: string;
  success?: boolean;
  intent?: "link-save";
};

type LinkSaveFormProps = {
  pageId: string;
  onSuccess?: () => void;
};

export default function LinkSaveForm({ pageId, onSuccess }: LinkSaveFormProps) {
  const fetcher = useFetcher();
  const actionData = fetcher.data as LinkSaveActionData | undefined;
  const [urlValue, setUrlValue] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const urlError = actionData?.fieldErrors?.url;
  const formError = actionData?.formError;
  const isSaving = fetcher.state !== "idle";
  const isUrlMissing = urlValue.trim().length === 0;
  const showRequiredError = shouldShowUrlRequiredError(hasInteracted, urlValue);
  const urlErrorMessage = showRequiredError ? "URL is required." : undefined;

  useEffect(() => {
    if (actionData?.success && actionData.intent === "link-save") {
      setUrlValue("");
      setHasInteracted(false);
      onSuccess?.();
    }
  }, [actionData?.success, actionData?.intent, onSuccess]);

  return (
    <fetcher.Form method="post" className="flex flex-col gap-3" noValidate>
      <input type="hidden" name="intent" value="link-save" />
      <input type="hidden" name="pageId" value={pageId} />
      <Field data-invalid={showRequiredError || !!urlError}>
        <FieldLabel htmlFor="link-url" className="text-sm font-medium">
          Link URL
        </FieldLabel>
        <FieldContent>
          <Input
            id="link-url"
            name="url"
            value={urlValue}
            autoComplete="off"
            onChange={(event) => setUrlValue(event.target.value)}
            onBlur={() => setHasInteracted(true)}
            placeholder="example.com"
            disabled={isSaving}
            aria-invalid={showRequiredError || !!urlError}
            aria-describedby={urlError ? "link-url-error" : undefined}
          />
          <FieldError
            id="link-url-error"
            errors={
              urlError || urlErrorMessage
                ? [{ message: urlError ?? urlErrorMessage ?? "" }]
                : []
            }
          />
        </FieldContent>
      </Field>
      {formError ? (
        <p className="text-destructive text-xs/relaxed" role="alert">
          {formError}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={isSaving || isUrlMissing}
        aria-busy={isSaving}
      >
        {isSaving ? "Saving..." : "Add link"}
      </Button>
    </fetcher.Form>
  );
}
