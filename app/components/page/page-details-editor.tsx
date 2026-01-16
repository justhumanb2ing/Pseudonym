import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  PAGE_DESCRIPTION_MAX_LENGTH,
  PAGE_TITLE_MAX_LENGTH,
} from "@/service/pages/page-details";
import { cn } from "@/lib/utils";
import { IconX } from "@tabler/icons-react";

type PageDetailsActionData = {
  fieldErrors?: {
    title?: string;
    description?: string;
  };
  formError?: string;
  success?: boolean;
};

type PageDetailsEditorProps = {
  pageId: string;
  title: string | null;
  description: string | null;
  isOwner: boolean;
};

export default function PageDetailsEditor({
  pageId,
  title,
  description,
  isOwner,
}: PageDetailsEditorProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const fetcher = useFetcher();
  const actionData = fetcher.data as PageDetailsActionData | undefined;
  const [open, setOpen] = useState(false);
  const [titleValue, setTitleValue] = useState(title ?? "");
  const [descriptionValue, setDescriptionValue] = useState(description ?? "");

  const descriptionError = actionData?.fieldErrors?.description;
  const formError = actionData?.formError;
  const isSaving = fetcher.state !== "idle";
  const isTitleMissing = titleValue.trim().length === 0;
  const titleErrorMessage = isTitleMissing ? "Title is required." : undefined;

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitleValue(title ?? "");
    setDescriptionValue(description ?? "");
  }, [open, title, description]);

  useEffect(() => {
    if (actionData?.success) {
      setOpen(false);
    }
  }, [actionData?.success]);

  const handleTitleChange = (nextValue: string) => {
    const nextTitle = nextValue.slice(0, PAGE_TITLE_MAX_LENGTH);
    setTitleValue(nextTitle);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const nextValue = event.target.value.slice(0, PAGE_DESCRIPTION_MAX_LENGTH);
    setDescriptionValue(nextValue);
  };

  const fieldCountClassName = "text-xs text-muted-foreground text-right mt-1";

  const editorContent = (
    <fetcher.Form method="post" className="flex flex-col gap-2" noValidate>
      <input type="hidden" name="pageId" value={pageId} />
      <Field data-invalid={isTitleMissing}>
        <FieldContent>
          <div className="relative">
            <FieldLabel
              htmlFor="page-title"
              className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground"
            >
              Title
            </FieldLabel>
            <Input
              id="page-title"
              name="title"
              value={titleValue}
              onValueChange={handleTitleChange}
              maxLength={PAGE_TITLE_MAX_LENGTH}
              disabled={!isOwner || isSaving}
              aria-invalid={isTitleMissing}
              placeholder="Add a title"
              className="px-3 pt-8 h-16 rounded-lg"
            />
          </div>
          <div className={fieldCountClassName}>
            {titleValue.length}/{PAGE_TITLE_MAX_LENGTH}
          </div>
          <FieldError
            errors={titleErrorMessage ? [{ message: titleErrorMessage }] : []}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldContent>
          <div className="relative">
            <FieldLabel
              htmlFor="page-description"
              className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground"
            >
              Bio
            </FieldLabel>
            <Textarea
              id="page-description"
              name="description"
              value={descriptionValue}
              onChange={handleDescriptionChange}
              maxLength={PAGE_DESCRIPTION_MAX_LENGTH}
              disabled={!isOwner || isSaving}
              aria-invalid={!!descriptionError}
              placeholder="Add a bio"
              className="px-3 pt-8 min-h-32 rounded-lg"
            />
          </div>
          <div className={fieldCountClassName}>
            {descriptionValue.length}/{PAGE_DESCRIPTION_MAX_LENGTH}
          </div>
          <FieldError
            errors={descriptionError ? [{ message: descriptionError }] : []}
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
        disabled={!isOwner || isSaving || isTitleMissing}
        className={"mt-2 h-12 text-base"}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </fetcher.Form>
  );

  const triggerLabel = title?.trim().length ? title : "Untitled";

  if (!isOwner) {
    return (
      <div className="text-lg font-semibold text-foreground">
        {triggerLabel}
      </div>
    );
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              className={cn("text-lg font-semibold hover:underline")}
            >
              {triggerLabel}
            </Button>
          }
        ></DialogTrigger>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className={"text-lg"}>Title & Bio</DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogClose
            render={
              <Button
                variant={"ghost"}
                size={"icon-lg"}
                className={"rounded-full absolute top-3 right-3"}
              >
                <IconX className="size-5" />
              </Button>
            }
          />
          {editorContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button type="button" variant="ghost" className="text-lg font-semibold hover:underline">
          {triggerLabel}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-2">
        <DrawerHeader>
          <DrawerTitle>Title & Bio</DrawerTitle>
          <DrawerDescription hidden></DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6">{editorContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
