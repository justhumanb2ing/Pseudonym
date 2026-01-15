import EditableParagraph from "@/components/legacy/profile/editable-paragraph";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LinkBrickViewModel } from "@/utils/link-brick-view-model";
import { LinkSimpleIcon } from "@phosphor-icons/react";

type LinkBrickViewProps = {
  viewModel: LinkBrickViewModel;
  title: string;
  titleClampClass: string;
  isUploading: boolean;
  isEditable: boolean;
  onTitleChange: (value: string) => void;
  onTitleBlur: () => void;
  onTitleFocus: () => void;
  linkUrl: string;
};

export function LinkBrickView({
  viewModel,
  title,
  titleClampClass,
  isUploading,
  isEditable,
  onTitleChange,
  onTitleBlur,
  onTitleFocus,
  linkUrl,
}: LinkBrickViewProps) {
  const renderTitle = (extraClass?: string) => (
    <EditableParagraph
      value={title}
      onValueChange={onTitleChange}
      onValueBlur={onTitleBlur}
      onFocus={onTitleFocus}
      readOnly={!isEditable}
      placeholder="Link title"
      ariaLabel="Link title"
      className={cn(
        "min-w-0 font-light text-foreground hover:bg-muted p-1 rounded-sm focus:bg-muted",
        titleClampClass,
        extraClass
      )}
    />
  );

  const renderIcon = () =>
    viewModel.showIcon ? (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-fit link-icon"
      >
        {viewModel.iconUrl ? (
          <img
            src={viewModel.iconUrl}
            alt=""
            className="size-7 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span className="size-5 shrink-0 rounded-lg flex items-center justify-center">
            <LinkSimpleIcon weight="bold" className="size-full" />
          </span>
        )}
      </a>
    ) : null;

  return (
    <div
      className={cn(
        "relative w-full box-border rounded-xl p-4 text-sm overflow-hidden",
        isUploading ? "bg-muted/60" : "bg-muted/30"
      )}
      aria-busy={isUploading}
    >
      {isUploading ? (
        <Skeleton className="absolute inset-0" />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {renderIcon()}
            <div className="min-w-0 flex-1">
              {renderTitle("line-clamp-2")}
            </div>
          </div>
          {viewModel.showDescription && (
            <p className={cn("text-muted-foreground", "line-clamp-2")}>
              {viewModel.description}
            </p>
          )}
          {viewModel.showSiteLabel && (
            <p className="text-muted-foreground text-xs">
              {viewModel.siteLabel}
            </p>
          )}
          {viewModel.showImage && (
            <div className="overflow-hidden rounded-lg">
              <img
                src={viewModel.imageUrl ?? ""}
                alt={viewModel.siteLabel ?? ""}
                className="h-36 w-full object-cover"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
