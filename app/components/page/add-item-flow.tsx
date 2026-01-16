import { useEffect, useState } from "react";

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
import { useMediaQuery } from "@/hooks/use-media-query";
import LinkSaveForm from "@/components/page/link-save-form";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ITEM_TYPES,
  type ItemTypeId,
} from "@/constants/add-item-flow.data";

import { IconPlus, IconX } from "@tabler/icons-react";

type AddItemFlowProps = {
  pageId: string;
};

export default function AddItemFlow({ pageId }: AddItemFlowProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<ItemTypeId | null>("link");

  useEffect(() => {
    if (open) {
      setSelectedId("link");
    }
  }, [open]);

  const title = "Add Item";

  const handleSelect = (nextId: ItemTypeId) => {
    setSelectedId(nextId);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const content = (
    <div className="py-4 w-full">
      <Tabs
        value={selectedId ?? "empty"}
        onValueChange={(value) => handleSelect(value as ItemTypeId)}
        orientation={isDesktop ? "vertical" : "horizontal"}
        className={cn(
          "w-full gap-6",
          isDesktop ? "flex-row h-full" : "flex-col"
        )}
      >
        <div className={cn("w-full", isDesktop ? "max-w-[220px]" : "px-0")}>
          <TabsList
            variant="default"
            className={cn(
              "w-full bg-background scrollbar-hide",
              isDesktop
                ? "flex-col items-stretch gap-1.5 p-1"
                : "flex-row gap-2 overflow-x-auto p-1"
            )}
          >
            {ITEM_TYPES.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className={cn(
                  "min-h-10 font-normal",
                  isDesktop ? "justify-start" : "shrink-0"
                )}
              >
                {item.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className={cn("w-full h-full", isDesktop ? "pr-6" : "px-5")}>
          <TabsContent value="link" className="flex min-h-[300px] flex-col">
            <div className="flex flex-col gap-4">
              <LinkSaveForm pageId={pageId} onSuccess={handleClose} />
            </div>
          </TabsContent>
          {ITEM_TYPES.filter((item) => item.id !== "link").map((item) => (
            <TabsContent
              key={item.id}
              value={item.id}
              className="flex min-h-[300px] flex-col"
            >
              <div className="flex flex-col gap-3 rounded-xl px-4 py-6">
                <span className="text-sm font-semibold text-foreground">
                  {`Add ${item.title.toLowerCase()}`}
                </span>
                <p className="text-xs text-muted-foreground">
                  This flow is coming soon. Select another item to switch.
                </p>
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );

  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            type="button"
            variant="brand"
            size="lg"
            onClick={() => setOpen(true)}
          >
            <IconPlus />
            Add
          </Button>
        </DrawerTrigger>
        <DrawerContent className="rounded-t-3xl border border-input bg-background">
          <DrawerHeader className="px-5 pb-0">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription hidden></DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="brand"
            size="lg"
            onClick={() => setOpen(true)}
          >
            <IconPlus />
            Add
          </Button>
        }
      />
      <DialogContent
        showCloseButton={false}
        className="rounded-2xl bg-background min-h-[520px] md:max-w-3xl"
      >
        <DialogHeader className="px-3" hidden>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogClose
          className={"absolute right-3 top-3"}
          render={
            <Button
              variant={"ghost"}
              size={"icon-lg"}
              className={"rounded-full"}
            >
              <IconX className="size-5" />
            </Button>
          }
        />
        {content}
      </DialogContent>
    </Dialog>
  );
}
