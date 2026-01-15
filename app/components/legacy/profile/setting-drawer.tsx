"use client";

import * as React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowSquareOutIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ChecksIcon,
  CircleIcon,
  DotsThreeOutlineIcon,
  GearSixIcon,
  SealCheckIcon,
  StackMinusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../../ui/tabs";
import { useParams } from "react-router";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../../ui/item";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

import DeleteAccountButton from "../auth/delete-account-button";
import { Activity } from "@/components/common/activity";
import {
  getUmamiEventAttributes,
  trackUmamiEvent,
} from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";

export const SETTING_TAB_LIST = [
  { value: "account", label: "Account" },
  { value: "handle", label: "Handle" },
  { value: "customization", label: "Customization" },
  { value: "analytics", label: "Analytics" },
];

type SettingTabValue = (typeof SETTING_TAB_LIST)[number]["value"];

function SettingsTabPanelContent({
  tabValue,
  handle,
}: {
  tabValue: SettingTabValue;
  handle?: string;
}) {
  switch (tabValue) {
    case "account":
      return (
        <div className="h-full flex flex-col gap-4 justify-end">
          <div className="text-right">
            <DeleteAccountButton />
            <p className="text-xs text-primary">
              Your data will be permanently deleted.
            </p>
          </div>
        </div>
      );

    case "handle":
      return (
        <div className="h-full flex flex-col gap-2 items-center">
          <Item variant={"muted"} className="rounded-xl">
            <ItemContent>
              <ItemTitle className="text-sm truncate line-clamp-1 w-60 xl:w-80">
                {handle}asdkfmalksdfmlaksdmflkasdflkamsdlkfmalskdmlaskdm
              </ItemTitle>
              <ItemDescription>Primary</ItemDescription>
            </ItemContent>
            <ItemMedia>
              <CircleIcon weight="fill" className="fill-green-500 size-3" />
            </ItemMedia>
          </Item>
          <div>
            <DotsThreeOutlineIcon
              weight="fill"
              className="size-5 text-muted-foreground"
            />
          </div>
          <div className="w-full rounded-xl border relative">
            <p className="-translate-y-1/2 absolute start-1 top-0 z-10 block bg-background p-2 text-sm text-muted-foreground">
              Other handles
            </p>
            <div className="rounde-xl flex flex-col gap-1 p-4 pt-5">
              <Item className="w-full rounded-lg flex items-center gap-2 flex-nowrap justify-between">
                <ItemContent className="flex-1 min-w-0 overflow-hidden">
                  <ItemTitle className="text-sm w-36 xl:w-60 truncate line-clamp-1">
                    Handle A
                  </ItemTitle>
                </ItemContent>
                <ItemMedia className="flex flex-row gap-1 shrink-0">
                  <Button variant={"ghost"} size={"icon-lg"}>
                    <ChecksIcon />
                  </Button>
                  <Button variant={"ghost"} size={"icon-lg"}>
                    <ArrowSquareOutIcon />
                  </Button>
                  <Button variant={"destructive"} size={"icon-lg"}>
                    <StackMinusIcon />
                  </Button>
                </ItemMedia>
              </Item>
              <Item className="w-full rounded-lg flex items-center gap-2 flex-nowrap justify-between">
                <ItemContent className="flex-1 min-w-0 overflow-hidden">
                  <ItemTitle className="text-sm w-36 xl:w-60 truncate line-clamp-1">
                    Handle B
                  </ItemTitle>
                </ItemContent>
                <ItemMedia className="flex flex-row gap-1 shrink-0">
                  <Button variant={"ghost"} size={"icon-lg"}>
                    <ChecksIcon />
                  </Button>
                  <Button variant={"ghost"} size={"icon-lg"}>
                    <ArrowSquareOutIcon />
                  </Button>
                  <Button variant={"destructive"} size={"icon-lg"}>
                    <StackMinusIcon />
                  </Button>
                </ItemMedia>
              </Item>
              <Item className="w-full rounded-lg flex items-center gap-2 flex-nowrap justify-between">
                <ItemContent className="flex-1 min-w-0 overflow-hidden">
                  <ItemTitle className="text-sm w-36 xl:w-60 truncate line-clamp-1">
                    Handle C
                  </ItemTitle>
                </ItemContent>
                <ItemMedia className="flex flex-row gap-1 shrink-0">
                  <Button variant={"ghost"} size={"icon-lg"}>
                    <ChecksIcon />
                  </Button>
                  <Button variant={"ghost"} size={"icon-lg"}>
                    <ArrowSquareOutIcon />
                  </Button>
                  <Button variant={"destructive"} size={"icon-lg"}>
                    <StackMinusIcon />
                  </Button>
                </ItemMedia>
              </Item>
            </div>
          </div>
        </div>
      );

    case "customization":
      return (
        <div className="rounded-lg h-full flex flex-col gap-4 from-muted/50 to-background bg-linear-to-b from-30%">
          {/* TODO: Replace with your customization component */}
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Not developed yet.</EmptyTitle>
              <EmptyDescription>
                I&apos;m currently building it...
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      );

    case "analytics":
      return (
        <div className="rounded-lg h-full flex flex-col gap-4 from-muted/50 to-background bg-linear-to-b from-30%">
          {/* TODO: Replace with your analytics component */}
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Not developed yet.</EmptyTitle>
              <EmptyDescription>
                I&apos;m currently building it...
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      );

    default:
      return null;
  }
}

export function SettingDrawer({
  tooltipLabel,
  isMobilePreview,
}: {
  tooltipLabel: string;
  isMobilePreview: boolean;
}) {
  const { handle } = useParams();
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<SettingTabValue | "main">(
    "main"
  );
  const [activityDirection, setActivityDirection] = React.useState<1 | -1>(1);
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const activeTabItem = SETTING_TAB_LIST.find((tab) => tab.value === activeTab);

  const handleDrawerOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setActiveTab("main");
    }
  };

  const handleTabSelect = (value: SettingTabValue) => {
    setActivityDirection(1);
    setActiveTab(value);
    trackUmamiEvent(
      UMAMI_EVENTS.feature.settings.tab,
      {
        [UMAMI_PROP_KEYS.ctx.tab]: value,
      },
      {
        dedupeKey: `settings-tab:${value}`,
        ttlMs: 2000,
      }
    );
  };

  const handleBackToList = () => {
    setActivityDirection(-1);
    setActiveTab("main");
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger
            render={
              <DialogTrigger
                render={
                  <Button
                    variant={"ghost"}
                    size={"icon-lg"}
                    {...getUmamiEventAttributes(
                      UMAMI_EVENTS.feature.settings.open,
                      {
                        [UMAMI_PROP_KEYS.ctx.source]: "settings_button",
                      }
                    )}
                  >
                    <GearSixIcon weight="regular" className="size-4" />
                  </Button>
                }
              />
            }
          />
          <TooltipContent side="bottom" sideOffset={8}>
            <p>{tooltipLabel}</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent
          showCloseButton={false}
          className="min-h-[620px] p-0 rounded-3xl sm:max-w-3xl sm:w-[750px]"
        >
          <DialogHeader hidden>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <header className="absolute top-3 right-3 h-fit flex justify-end items-center">
            <aside>
              <DialogClose
                render={
                  <Button
                    variant={"ghost"}
                    size={"icon-lg"}
                    className={"size-8 rounded-full"}
                  >
                    <XIcon weight="bold" className="size-4" />
                  </Button>
                }
              />
            </aside>
          </header>
          <section>
            <Tabs
              className="w-full h-full flex-row divide-x divide-muted"
              defaultValue="account"
              orientation="vertical"
            >
              <div className="w-1/3 p-5">
                <div className="flex flex-col gap-2">
                  <Item>
                    <ItemContent>
                      <ItemTitle>
                        <SealCheckIcon
                          weight="fill"
                          className="size-5 fill-brand"
                        />
                        <span className="text-sm">{handle}</span>
                      </ItemTitle>
                    </ItemContent>
                  </Item>
                  <TabsList className={"bg-background w-full"}>
                    {SETTING_TAB_LIST.map((tab) => (
                      <TabsTab
                        key={tab.value}
                        value={tab.value}
                        className={
                          "w-full shadow-none px-4 py-4 h-10! font-normal"
                        }
                        {...getUmamiEventAttributes(
                          UMAMI_EVENTS.feature.settings.tab,
                          {
                            [UMAMI_PROP_KEYS.ctx.tab]: tab.value,
                          }
                        )}
                      >
                        {tab.label}
                      </TabsTab>
                    ))}
                  </TabsList>
                </div>
              </div>
              <TabsPanel value="account" className={"p-6 flex flex-col gap-6"}>
                <h3 className="text-xl">Account</h3>
                <SettingsTabPanelContent tabValue="account" />
              </TabsPanel>

              <TabsPanel value="handle" className={"p-6 flex flex-col gap-6"}>
                <h3 className="text-xl">Handle</h3>
                <SettingsTabPanelContent tabValue="handle" handle={handle} />
              </TabsPanel>

              <TabsPanel
                value="customization"
                className={"p-6 flex flex-col gap-6"}
              >
                <h3 className="text-xl">Customization</h3>
                <SettingsTabPanelContent tabValue="customization" />
              </TabsPanel>

              <TabsPanel
                value="analytics"
                className={"p-6 flex flex-col gap-6"}
              >
                <h3 className="text-xl">Analytics</h3>
                <SettingsTabPanelContent tabValue="analytics" />
              </TabsPanel>
            </Tabs>
          </section>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleDrawerOpenChange}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DrawerTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon-lg"}
                {...getUmamiEventAttributes(
                  UMAMI_EVENTS.feature.settings.open,
                  {
                    [UMAMI_PROP_KEYS.ctx.source]: "settings_button",
                  }
                )}
              >
                <GearSixIcon weight="regular" className="size-4" />
              </Button>
            </DrawerTrigger>
          }
        />
        <TooltipContent side="bottom" sideOffset={8}>
          <p>{tooltipLabel}</p>
        </TooltipContent>
      </Tooltip>
      <DrawerContent className="min-h-[500px] max-h-[calc(100%-5rem)] pb-10">
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
        <section className="grow px-4 mt-16 h-full overflow-y-scroll scrollbar-hide flex">
          <Activity
            activeKey={activeTab}
            direction={activityDirection}
            className={"grow"}
          >
            {activeTab === "main" ? (
              <div className="flex flex-col gap-2">
                {SETTING_TAB_LIST.map((tab) => (
                  <Item
                    key={tab.value}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleTabSelect(tab.value)}
                  >
                    <ItemContent>
                      <ItemTitle className="text-base font-normal">
                        {tab.label}
                      </ItemTitle>
                    </ItemContent>
                    <ItemMedia className="flex flex-row gap-1">
                      <Button variant={"ghost"} size={"icon-lg"}>
                        <CaretRightIcon weight="bold" className="size-5" />
                      </Button>
                    </ItemMedia>
                  </Item>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-6 h-full">
                <header className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={"ghost"}
                    size={"icon-lg"}
                    onClick={handleBackToList}
                    aria-label="Back to settings list"
                  >
                    <CaretLeftIcon weight="bold" className="size-5" />
                  </Button>
                  <h3 className="text-lg font-semibold">
                    {activeTabItem?.label}
                  </h3>
                </header>
                <SettingsTabPanelContent tabValue={activeTab} handle={handle} />
              </div>
            )}
          </Activity>
        </section>
      </DrawerContent>
    </Drawer>
  );
}
