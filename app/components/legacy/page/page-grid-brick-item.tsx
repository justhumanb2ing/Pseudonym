import { Item } from "@/components/ui/item";
import PageGridTextBrick from "@/components/legacy/page/page-grid-text-brick";
import { cn } from "@/lib/utils";
import type { PageGridBrick } from "../../../service/pages/page-grid";
import { useLinkBrickState } from "./link-brick/use-link-brick-state";
import { LinkBrickView } from "./link-brick/link-brick-view";

type PageGridBrickItemProps = {
  brick: PageGridBrick;
};

export default function PageGridBrickItem({ brick }: PageGridBrickItemProps) {
  return (
    <Item
      variant="muted"
      className={cn(
        "w-full rounded-3xl p-0 bg-background",
        brick.type === "link" && "rounded-xl"
      )}
      render={
        <div
          className={cn(
            "w-full min-h-0 min-w-0 self-stretch",
            brick.type !== "text" &&
              "shadow-[0px_6px_13px_-6px_rgba(0,0,0,0.1)] border-none ring ring-[#e5e5e5] dark:ring-[#2b2b2b]"
          )}
        >
          {brick.type === "text" ? (
            <PageGridTextBrick brick={brick} />
          ) : (
            <LinkBrickContent brick={brick} />
          )}
        </div>
      }
    />
  );
}

type LinkBrickContentProps = {
  brick: PageGridBrick<"link">;
};

function LinkBrickContent({ brick }: LinkBrickContentProps) {
  const {
    viewModel,
    title,
    titleClampClass,
    isUploading,
    isEditable,
    handleTitleChange,
    handleTitleBlur,
    handleTitleFocus,
  } = useLinkBrickState({ brick });

  return (
    <LinkBrickView
      viewModel={viewModel}
      title={title}
      titleClampClass={titleClampClass}
      isUploading={isUploading}
      isEditable={isEditable}
      onTitleChange={handleTitleChange}
      onTitleBlur={handleTitleBlur}
      onTitleFocus={handleTitleFocus}
      linkUrl={brick.data.url}
    />
  );
}
