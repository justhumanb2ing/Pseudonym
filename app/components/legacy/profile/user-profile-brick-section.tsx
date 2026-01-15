import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageGridBrickSection from "@/components/legacy/page/page-grid-brick-section";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

type UserProfileBrickSectionProps = {
  isMobilePreview: boolean;
  isEmpty: boolean;
};

export default function UserProfileBrickSection({
  isMobilePreview,
  isEmpty,
}: UserProfileBrickSectionProps) {
  return (
    <section
      className={cn(
        "shrink-0 sticky z-10",
        "bg-background rounded-t-3xl",
        !isMobilePreview &&
          "xl:static xl:z-0 xl:w-full xl:max-w-[880px] xl:rounded-t-[32px] xl:top-32 xl:overflow-hidden"
      )}
    >
      {/* Drag Handle Indicator */}
      <div
        className={cn(
          "sticky top-0 z-20 flex justify-center pt-3 pb-2 bg-background rounded-t-3xl",
          isMobilePreview ? "rounded-t-3xl" : "xl:hidden xl:rounded-none"
        )}
      >
        <div
          className={cn(
            "w-9 h-1 rounded-full bg-muted-foreground/25",
            "transition-colors duration-200"
          )}
          aria-hidden="true"
        />
      </div>

      {isEmpty && (
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyTitle className="text-lg">Empty</EmptyTitle>
            <EmptyDescription className="text-sm/relaxed">
              Everything remains the same for the time being.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <ScrollArea
        className={cn(
          "w-full h-[calc(100%-20px)]",
          !isMobilePreview && "xl:w-[880px]"
        )}
        scrollFade
        scrollbarGutter
        scrollbarHidden
      >
        <div className={cn("w-full px-3 pb-32 pt-4", !isMobilePreview && "xl:px-0")}>
          <PageGridBrickSection isMobilePreview={isMobilePreview} />
        </div>
      </ScrollArea>
    </section>
  );
}
