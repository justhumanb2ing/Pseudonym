import { cn } from "@/lib/utils";
import {
  usePageGridActions,
  usePageGridState,
} from "@/components/legacy/page/page-grid-context";
import PageGridBrickItem from "@/components/legacy/page/page-grid-brick-item";
import { Button } from "../../ui/button";
import { StackMinusIcon } from "@phosphor-icons/react";
import { getUmamiEventAttributes } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";

type PageGridBrickSectionProps = {
  isMobilePreview?: boolean;
};

export default function PageGridBrickSection({
  isMobilePreview = false,
}: PageGridBrickSectionProps) {
  const { bricks } = usePageGridState();
  const { removeBrick, isEditable } = usePageGridActions();

  const handleBlockRemove = (brickId: string) => {
    if (!isEditable) {
      return;
    }

    removeBrick(brickId);
  };

  return (
    <div className={cn("flex flex-col gap-4", !isMobilePreview && "xl:gap-5")}>
      {bricks.map((brick) => (
        <div key={brick.id} className={cn("relative", isEditable && "group")}>
          {isEditable && (
            <aside
              className={cn(
                "absolute opacity-0 pointer-events-none transition duration-150 group-hover:opacity-100 group-hover:pointer-events-auto",
                "-top-3 -right-2"
              )}
            >
              <div
                className={cn(
                  "pointer-events-auto bg-black/80 backdrop-blur-md p-1 rounded-xl flex shadow-xl border border-white/10 animate-in fade-in zoom-in duration-200 items-center"
                )}
              >
                <Button
                  type="button"
                  size={"icon-lg"}
                  variant={"ghost"}
                  className={cn("transition-all rounded-lg hover:bg-white/10")}
                  aria-label="블록 삭제"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleBlockRemove(brick.id);
                  }}
                  {...getUmamiEventAttributes(UMAMI_EVENTS.feature.brick.remove, {
                    [UMAMI_PROP_KEYS.ctx.brickType]: brick.type,
                  })}
                >
                  <StackMinusIcon weight="bold" className="size-4 text-white" />
                </Button>
              </div>
            </aside>
          )}
          <PageGridBrickItem brick={brick} />
        </div>
      ))}
    </div>
  );
}
