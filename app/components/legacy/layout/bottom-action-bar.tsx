import { ChartBarIcon } from "@phosphor-icons/react";
import { useIntlayer, useLocale } from "react-intlayer";
import { useParams } from "react-router";
import ChangeHandleFormPopover from "../profile/change-handle-form-popover";
import { locacalizeTo } from "../i18n/localized-link";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { ThemeToggle } from "./theme-toggle";
import UserAuthButton from "../auth/user-auth-button";
import { OwnerGate } from "../auth/owner-gate";
import { Separator } from "../../ui/separator";
import LocaleSwitcher from "../i18n/locale-switcher";
import { SettingDrawer } from "../profile/setting-drawer";

interface BottomActionBarProps {
  isOwner: boolean;
  isMobilePreview: boolean;
}

export default function BottomActionBar({
  isOwner,
  isMobilePreview,
}: BottomActionBarProps) {
  const { handle } = useParams();
  const { analyticsComingSoon, settingsLabel } = useIntlayer("bottomActionBar");

  return (
    <div className="flex items-center gap-1">
      {/* Analytics Link Button */}
      <OwnerGate isOwner={isOwner}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant={"ghost"} size={"icon-lg"}>
                <ChartBarIcon weight="regular" className="size-4" />
              </Button>
            }
          />
          <TooltipContent side="bottom" sideOffset={8}>
            <p>{analyticsComingSoon.value}</p>
          </TooltipContent>
        </Tooltip>
      </OwnerGate>

      {/* Change Handle Button */}
      <OwnerGate isOwner={isOwner}>
        <ChangeHandleFormPopover handle={handle} />
      </OwnerGate>

      {/* Setting Link Button */}
      <OwnerGate isOwner={isOwner}>
        <SettingDrawer
          tooltipLabel={settingsLabel.value}
          isMobilePreview={isMobilePreview}
        />
      </OwnerGate>

      <ThemeToggle iconSize="size-4" />

      <Separator
        orientation="vertical"
        className={
          "my-1.5 rounded-full data-[orientation=vertical]:bg-muted data-[orientation=vertical]:w-0.5"
        }
      />

      <LocaleSwitcher />
      <UserAuthButton />
    </div>
  );
}
