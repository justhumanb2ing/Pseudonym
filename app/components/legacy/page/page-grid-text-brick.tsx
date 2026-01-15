import { useCallback, useRef, type RefObject } from "react";

import EditableParagraph from "@/components/legacy/profile/editable-paragraph";
import { usePageGridActions } from "@/components/legacy/page/page-grid-context";
import type { PageGridBrick } from "../../../service/pages/page-grid";
import { cn } from "@/lib/utils";
import { usePageGridTextBrickEditHandlers } from "./hooks/use-page-grid-text-brick-edit-handlers";

type PageGridTextBrickProps = {
  brick: PageGridBrick<"text">;
};

export default function PageGridTextBrick({ brick }: PageGridTextBrickProps) {
  const { updateTextBrick, isEditable } = usePageGridActions();
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);

  const pushUpdate = useCallback(
    (text: string, isEditing: boolean) => {
      updateTextBrick({
        id: brick.id,
        text,
        isEditing,
      });
    },
    [brick.id, updateTextBrick]
  );

  const { handleValueChange, handleValueBlur } =
    usePageGridTextBrickEditHandlers(brick.data.text, pushUpdate);

  return (
    <div className="flex w-full min-w-0 box-border items-center rounded-xl min-h-16! px-2 hover:shadow-[0px_6px_13px_-6px_rgba(0,0,0,0.1)] hover:border-[0.5px] transition-all duration-150 py-2">
      <EditableParagraph
        elementRef={paragraphRef as RefObject<HTMLParagraphElement>}
        value={brick.data.text}
        onValueChange={handleValueChange}
        onValueBlur={handleValueBlur}
        readOnly={!isEditable}
        placeholder="Write something..."
        multiline
        ariaLabel="Text block"
        className={cn(
          "min-w-48 w-fit max-w-full rounded-lg wrap-break-word break-all text-wrap box-border text-lg px-4 py-3.5 font-medium text-foreground transition-colors duration-300",
          "focus:bg-muted hover:bg-muted",
          "data-[empty=true]:max-w-full",
          "data-[empty=true]:before:top-3.5 data-[empty=true]:before:left-5",
          "xl:py-2.5 xl:data-[empty=true]:before:top-2.5"
        )}
        style={{ minHeight: 0 }}
      />
    </div>
  );
}
