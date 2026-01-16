import { SignOutButton, useUser } from "@clerk/react-router";
import { useLocation } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { IconLogout } from "@tabler/icons-react";
import { getUmamiEventAttributes } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";

export default function UserDropdown() {
  const { user, isLoaded } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return <Spinner />;
  }

  if (!user) {
    return null;
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const fallback = user.firstName?.charAt(0)?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="py-6 flex justify-start gap-2 px-2 rounded-lg hover:bg-accent"
          >
            <Avatar size="lg">
              <AvatarImage src={user.imageUrl} alt={name} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <span className="max-w-[150px] truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
              {name || user.username || user.primaryEmailAddress?.emailAddress}
            </span>
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <SignOutButton
          redirectUrl={`${location.pathname}${location.search}${location.hash}`}
        >
          <DropdownMenuItem
            className="cursor-pointer"
            render={
              <Button
                variant={"ghost"}
                size={"lg"}
                className={"w-full justify-start"}
                {...getUmamiEventAttributes(UMAMI_EVENTS.auth.signOut.click, {
                  [UMAMI_PROP_KEYS.ctx.source]: "bottom_action_bar",
                })}
                render={
                  <SignOutButton>
                    <div>
                      <IconLogout className="size-4" />
                      <span>Log out</span>
                    </div>
                  </SignOutButton>
                }
              ></Button>
            }
          ></DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
