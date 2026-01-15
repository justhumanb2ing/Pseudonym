import { useRef, useState, type FormEvent } from "react";
import {
  ToolbarButton,
  ToolbarGroup,
  Toolbar as ToolbarRoot,
} from "../../ui/toolbar";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Input } from "../../ui/input";
import { Popover, PopoverPanel, PopoverTrigger } from "../../ui/popover";
import { toastManager } from "@/components/ui/toast";
import { usePageGridActions } from "@/components/legacy/page/page-grid-context";
import { LinkSimpleIcon, QuotesIcon, XIcon } from "@phosphor-icons/react";
import { useAuth } from "@clerk/react-router";
import { resolveExternalHref } from "@/utils/resolve-external-href";
import type { OgCrawlResponse } from "types/link-crawl";
import { isMobileWeb } from "@toss/utils";
import {
  createUmamiAttemptId,
  getUmamiEventAttributes,
  trackUmamiEvent,
} from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";

export default function AppToolbar() {
  const { addTextBrick, addLinkBrick, updateLinkBrick, removeBrick, isEditable } =
    usePageGridActions();
  const { getToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("");
  const [isLinkSubmitting, setIsLinkSubmitting] = useState(false);
  const isMobileDevice = isMobileWeb();

  const handleLinkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isEditable || isLinkSubmitting) {
      return;
    }

    const trimmedUrl = linkInputValue.trim();
    const normalizedUrl = resolveExternalHref(trimmedUrl);
    if (!normalizedUrl) {
      toastManager.add({
        type: "error",
        title: "Missing link",
        description: "Enter a URL to create a link item.",
      });
      return;
    }

    const placeholderId = addLinkBrick(normalizedUrl);
    const attemptId = createUmamiAttemptId("link");
    trackUmamiEvent(
      UMAMI_EVENTS.feature.link.submit,
      {
        [UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
        [UMAMI_PROP_KEYS.ctx.source]: "toolbar",
      },
      {
        dedupeKey: `link-submit:${attemptId}`,
        once: true,
      }
    );
    setIsLinkSubmitting(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      const crawlerEndpoint = import.meta.env.VITE_CRAWLER_SERVER_ENDPOINT;
      if (!crawlerEndpoint) {
        throw new Error("Crawler server endpoint is not configured.");
      }

      const response = await fetch(
        `${crawlerEndpoint.replace(/\/$/, "")}/api/crawl?url=${normalizedUrl}&mode=auto`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create link.");
      }

      const { data } = (await response.json()) as OgCrawlResponse;

      updateLinkBrick({
        id: placeholderId,
        data: {
          title: data.title ?? null,
          description: data.description ?? null,
          site_name: data.site_name ?? null,
          url: data.url ?? normalizedUrl,
          icon_url: data.favicon ?? null,
          image_url: data.image ?? null,
        },
      });

      setLinkInputValue("");
      inputRef.current?.focus();
      trackUmamiEvent(
        UMAMI_EVENTS.feature.link.success,
        {
          [UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
          [UMAMI_PROP_KEYS.ctx.source]: "toolbar",
        },
        {
          dedupeKey: `link-success:${attemptId}`,
          once: true,
        }
      );
    } catch (error) {
      removeBrick(placeholderId);
      toastManager.add({
        type: "error",
        title: "Link fetch failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
      trackUmamiEvent(
        UMAMI_EVENTS.feature.link.error,
        {
          [UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
          [UMAMI_PROP_KEYS.ctx.source]: "toolbar",
          [UMAMI_PROP_KEYS.ctx.errorCode]: "fetch_failed",
        },
        {
          dedupeKey: `link-error:${attemptId}`,
          once: true,
        }
      );
    } finally {
      setIsLinkSubmitting(false);
    }
  };

  const handleClearInput = () => {
    setLinkInputValue("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleTextClick = () => {
    if (!isEditable) {
      return;
    }

    addTextBrick();
  };

  if (!isEditable || isMobileDevice) {
    return null;
  }

  return (
    <ToolbarRoot className={"toolbar-shadow border-0 px-3 py-2"}>
      <ToolbarGroup className={"gap-2"}>
        <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={
                    <ToolbarButton
                      render={
                        <Button
                          size={"icon-lg"}
                          variant={"ghost"}
                          className={"size-8 p-1"}
                          type="button"
                          {...getUmamiEventAttributes(
                            UMAMI_EVENTS.feature.brick.add,
                            {
                              [UMAMI_PROP_KEYS.ctx.brickType]: "link",
                              [UMAMI_PROP_KEYS.ctx.source]: "toolbar",
                            }
                          )}
                        >
                          <LinkSimpleIcon />
                        </Button>
                      }
                    />
                  }
                />
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              <p>Link</p>
            </TooltipContent>
          </Tooltip>
          <PopoverPanel
            side="top"
            sideOffset={16}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 28,
            }}
            className="w-64 rounded-[16px] p-0 overflow-hidden border-[0.5px]"
          >
            <form className="relative" onSubmit={handleLinkSubmit}>
              <Input
                ref={inputRef}
                autoComplete="off"
                autoFocus
                placeholder="Link"
                value={linkInputValue}
                onChange={(event) => setLinkInputValue(event.target.value)}
                aria-label="Link URL"
                className="font-light text-sm! bg-transparent focus-visible:border-none focus-visible:ring-0 h-11 pl-3 pe-9 placeholder:text-ring"
                disabled={isLinkSubmitting}
              />
              {linkInputValue && (
                <button
                  aria-label="Clear input"
                  className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md outline-none transition-[color,box-shadow] focus:z-10 focus-visible:border-0 focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleClearInput}
                  type="button"
                  disabled={isLinkSubmitting}
                >
                  <XIcon aria-hidden="true" weight="bold" className="size-4" />
                </button>
              )}
            </form>
          </PopoverPanel>
        </Popover>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToolbarButton
                render={
                  <Button
                    type="button"
                    size={"icon-lg"}
                    variant={"ghost"}
                    className={"size-8 p-1"}
                    onClick={handleTextClick}
                    disabled={!isEditable}
                    aria-disabled={!isEditable}
                    {...getUmamiEventAttributes(
                      UMAMI_EVENTS.feature.brick.add,
                      {
                        [UMAMI_PROP_KEYS.ctx.brickType]: "text",
                        [UMAMI_PROP_KEYS.ctx.source]: "toolbar",
                      }
                    )}
                  >
                    <QuotesIcon />
                  </Button>
                }
              />
            }
          />
          <TooltipContent side="top" sideOffset={8}>
            <p>Text</p>
          </TooltipContent>
        </Tooltip>
      </ToolbarGroup>
    </ToolbarRoot>
  );
}
