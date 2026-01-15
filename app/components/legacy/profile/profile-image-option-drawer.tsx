import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import VisibilityToggle from "./visibility-toggle";
import { useState, type RefObject } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../ui/drawer";
import { getUmamiEventAttributes } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import { DotsThreeIcon } from "@phosphor-icons/react";
import { Item, ItemContent } from "../../ui/item";

interface ProfileImageOptionDrawerProps {
  imageRef: RefObject<HTMLInputElement | null>;
  pageId: string;
  isVisible: boolean;
  hasImage: boolean;
  onRemoveImage: () => void;
}

export default function ProfileImageOptionDrawer({
  imageRef,
  pageId,
  isVisible,
  hasImage,
  onRemoveImage,
}: ProfileImageOptionDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const [open, setOpen] = useState(false);

  const handleSelectImage = () => imageRef.current?.click();
  const handleUpload = () => {
    setOpen(false);
    handleSelectImage();
  };
  const handleRemove = () => {
    setOpen(false);
    onRemoveImage();
  };

  // Popover
  if (isDesktop) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size={"icon-sm"}
              className={"rounded-full size-10 border bg-primary/50"}
              aria-label="Profile image actions"
            >
              <DotsThreeIcon weight="bold" className="size-6" />
            </Button>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent className="w-44 p-3 rounded-2xl" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={"text-base font-medium py-3 rounded-lg"}
              onClick={handleUpload}
              {...getUmamiEventAttributes(
                UMAMI_EVENTS.feature.profileImage.upload,
                {
                  [UMAMI_PROP_KEYS.ctx.pageId]: pageId,
                  [UMAMI_PROP_KEYS.ctx.action]: "click",
                  [UMAMI_PROP_KEYS.ctx.source]: "profile_menu",
                }
              )}
            >
              Upload
            </DropdownMenuItem>
            <DropdownMenuItem
              className={"text-base font-medium py-3 rounded-lg"}
              disabled={!hasImage}
              onClick={handleRemove}
              {...getUmamiEventAttributes(
                UMAMI_EVENTS.feature.profileImage.remove,
                {
                  [UMAMI_PROP_KEYS.ctx.pageId]: pageId,
                  [UMAMI_PROP_KEYS.ctx.action]: "click",
                  [UMAMI_PROP_KEYS.ctx.source]: "profile_menu",
                }
              )}
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={<VisibilityToggle pageId={pageId} isPublic={isVisible} />}
            ></DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Drawer for mobile
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size={"icon-lg"}
          className={
            "rounded-full size-10 bg-primary/70 backdrop-blur-xs drop-shadow-lg"
          }
          aria-label="Profile image actions"
        >
          <DotsThreeIcon weight="bold" className="size-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-fit">
        <DrawerHeader hidden>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <header className="absolute top-8 right-9 h-fit flex justify-end items-center">
          <aside>
            <DrawerClose asChild>
              <Button
                variant={"brand"}
                size={"lg"}
                className={"p-5 text-base dark:text-foreground"}
              >
                Cancel
              </Button>
            </DrawerClose>
          </aside>
        </header>
        <section className="grow px-4 py-10 mt-4 h-full overflow-y-scroll scrollbar-hide flex flex-col">
          <Item className="rounded-lg hover:bg-muted/80">
            <ItemContent
              className={"text-base font-medium py-1"}
              onClick={handleUpload}
              {...getUmamiEventAttributes(
                UMAMI_EVENTS.feature.profileImage.upload,
                {
                  [UMAMI_PROP_KEYS.ctx.pageId]: pageId,
                  [UMAMI_PROP_KEYS.ctx.action]: "click",
                  [UMAMI_PROP_KEYS.ctx.source]: "profile_menu",
                }
              )}
            >
              Upload
            </ItemContent>
          </Item>
          {hasImage && (
            <Item className="rounded-lg hover:bg-muted/80">
              <ItemContent
                className={"text-base font-medium py-1"}
                onClick={handleRemove}
                {...getUmamiEventAttributes(
                  UMAMI_EVENTS.feature.profileImage.remove,
                  {
                    [UMAMI_PROP_KEYS.ctx.pageId]: pageId,
                    [UMAMI_PROP_KEYS.ctx.action]: "click",
                    [UMAMI_PROP_KEYS.ctx.source]: "profile_menu",
                  }
                )}
              >
                Remove
              </ItemContent>
            </Item>
          )}
          <Item className="p-0.5">
            <ItemContent>
              <VisibilityToggle pageId={pageId} isPublic={isVisible} />
            </ItemContent>
          </Item>
        </section>
      </DrawerContent>
    </Drawer>
  );
}
