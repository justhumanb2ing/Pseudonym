import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowsLeftRightIcon, CheckIcon } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { useIntlayer } from "react-intlayer";
import { z } from "zod";

import { Button } from "../../ui/button";
import {
  Form as RhfForm,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import {
  Popover,
  PopoverDescription,
  PopoverTitle,
  PopoverPanel,
  PopoverTrigger,
} from "../../ui/popover";
import { Spinner } from "../../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useLocalizedNavigate } from "@/hooks/use-localized-navigate";
import { getSupabaseClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  createUmamiAttemptId,
  getUmamiEventAttributes,
  trackUmamiEvent,
} from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";

const handleSchema = z.object({
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+$/, "Only lowercase letters and numbers are allowed."),
});

type HandleFormValues = z.infer<typeof handleSchema>;

interface ChangeHandleFormPopoverProps {
  handle?: string;
}

export default function ChangeHandleFormPopover({
  handle,
}: ChangeHandleFormPopoverProps) {
  const { changeHandleTooltip } = useIntlayer("changeHandle");
  const localizedNavigate = useLocalizedNavigate();
  const [isHandlePopoverOpen, setIsHandlePopoverOpen] = useState(false);
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [isUpdatingHandle, setIsUpdatingHandle] = useState(false);
  const supabase = getSupabaseClient();
  const currentHandleValue = handle?.replace(/^@/, "") ?? "";
  const canChangeHandle = Boolean(handle);

  const form = useForm<HandleFormValues>({
    resolver: zodResolver(handleSchema),
    defaultValues: { handle: currentHandleValue },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const handleValue = form.watch("handle") ?? "";
  const rootError = form.formState.errors.root?.message;
  const isSaving = isCheckingHandle || isUpdatingHandle;

  useEffect(() => {
    form.reset({ handle: currentHandleValue });
  }, [currentHandleValue, form]);

  const checkHandleAvailability = async () => {
    if (isCheckingHandle || isUpdatingHandle) {
      return false;
    }

    const isHandleValid = await form.trigger("handle");
    if (!isHandleValid) {
      return false;
    }

    if (!supabase) {
      form.setError("handle", {
        type: "manual",
        message: "Handle validation is unavailable.",
      });
      return false;
    }

    setIsCheckingHandle(true);
    form.clearErrors("handle");

    let data: { id: string } | null = null;
    let error: { message: string } | null = null;
    const sanitizedHandle = form.getValues("handle");

    try {
      const result = await (await supabase)
        .from("pages")
        .select("id")
        .eq("handle", `@${sanitizedHandle}`)
        .maybeSingle();
      data = result.data;
      error = result.error;
    } finally {
      setIsCheckingHandle(false);
    }

    if (error) {
      form.setError("handle", {
        type: "manual",
        message: error.message,
      });
      return false;
    }

    if (data) {
      form.setError("handle", {
        type: "manual",
        message: "Handle already exists.",
      });
      return false;
    }

    return true;
  };

  const submitHandleChange = form.handleSubmit(async () => {
    form.clearErrors("root");

    if (!handle) {
      form.setError("root", {
        type: "manual",
        message: "Handle update is unavailable.",
      });
      return;
    }

    const attemptId = createUmamiAttemptId("handle");
    trackUmamiEvent(
      UMAMI_EVENTS.feature.handle.submit,
      {
        [UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
        [UMAMI_PROP_KEYS.ctx.source]: "change_handle",
      },
      {
        dedupeKey: `handle-submit:${attemptId}`,
        once: true,
      }
    );

    const isAvailable = await checkHandleAvailability();
    if (!isAvailable) {
      trackUmamiEvent(
        UMAMI_EVENTS.feature.handle.error,
        {
          [UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
          [UMAMI_PROP_KEYS.ctx.source]: "change_handle",
          [UMAMI_PROP_KEYS.ctx.errorCode]: "validation",
        },
        {
          dedupeKey: `handle-error:${attemptId}`,
          once: true,
        }
      );
      return;
    }

    setIsUpdatingHandle(true);
    const sanitizedHandle = form.getValues("handle");

    try {
      const { error } = await (
        await supabase
      )
        .from("pages")
        .update({ handle: `@${sanitizedHandle}` })
        .eq("handle", handle);

      if (error) {
        form.setError("root", {
          type: "server",
          message: error.message,
        });
        trackUmamiEvent(
          UMAMI_EVENTS.feature.handle.error,
          {
            [UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
            [UMAMI_PROP_KEYS.ctx.source]: "change_handle",
            [UMAMI_PROP_KEYS.ctx.errorCode]: "update_failed",
          },
          {
            dedupeKey: `handle-error:${attemptId}`,
            once: true,
          }
        );
        return;
      }

      setIsHandlePopoverOpen(false);
      localizedNavigate(`/@${sanitizedHandle}`);
      trackUmamiEvent(
        UMAMI_EVENTS.feature.handle.success,
        {
          [UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
          [UMAMI_PROP_KEYS.ctx.source]: "change_handle",
        },
        {
          dedupeKey: `handle-success:${attemptId}`,
          once: true,
        }
      );
    } finally {
      setIsUpdatingHandle(false);
    }
  });

  return (
    <Popover
      open={isHandlePopoverOpen}
      onOpenChange={(nextOpen) => {
        if (!canChangeHandle && nextOpen) {
          return;
        }

        setIsHandlePopoverOpen(nextOpen);

        if (nextOpen) {
          form.clearErrors();
          return;
        }

        form.reset({ handle: currentHandleValue });
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant={"ghost"}
                  size={"icon-lg"}
                  aria-label="Change Handle"
                  disabled={!canChangeHandle}
                  {...getUmamiEventAttributes(UMAMI_EVENTS.feature.handle.open, {
                    [UMAMI_PROP_KEYS.ctx.source]: "bottom_action_bar",
                  })}
                >
                  <ArrowsLeftRightIcon weight="regular" className="size-4" />
                </Button>
              }
            />
          }
        />
        <TooltipContent side="bottom" sideOffset={8}>
          <p>{changeHandleTooltip.value}</p>
        </TooltipContent>
      </Tooltip>
      <PopoverPanel
        side="bottom"
        sideOffset={12}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 28,
        }}
        className="w-84 rounded-3xl p-6 gap-0 ring-secondary"
      >
        <PopoverTitle className={"font-medium"}>Change handle</PopoverTitle>
        <PopoverDescription className={"text-muted-foreground text-sm"}>
          Choose a unique handle for your page.
        </PopoverDescription>
        <RhfForm {...form}>
          <form className="space-y-3" onSubmit={submitHandleChange}>
            <FormField
              control={form.control}
              name="handle"
              render={({ field }) => (
                <FormItem className="mt-4 space-y-2">
                  <FormLabel className="sr-only">Handle</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoFocus
                        placeholder="Your handle"
                        value={field.value ?? ""}
                        onChange={(event) => {
                          field.onChange(event.target.value);
                          form.clearErrors("handle");
                          form.clearErrors("root");
                        }}
                        className={cn("peer ps-29 border-none h-10 text-base!")}
                      />
                    </FormControl>
                    <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground text-base! peer-disabled:opacity-50">
                      @
                    </span>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            {rootError ? (
              <p className="text-destructive text-sm" role="alert">
                {rootError}
              </p>
            ) : null}
            <Button
              className="w-full text-base h-10"
              size="lg"
              type="submit"
              variant="brand"
              disabled={!handleValue || isSaving}
              aria-busy={isSaving}
              data-icon={isUpdatingHandle ? "inline-start" : undefined}
            >
              {isUpdatingHandle ? <Spinner /> : "Update"}
            </Button>
          </form>
        </RhfForm>
      </PopoverPanel>
    </Popover>
  );
}
