import LocaleSwitcher from "@/components/i18n/locale-switcher";
import { SignedIn, SignedOut } from "@clerk/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import UserButton from "@/components/auth/user-button";
import { getUmamiEventAttributes } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import { LocalizedLink } from "@/components/i18n/localized-link";
import Logo from "@/components/common/logo";

type HomeHeaderProps = {
  primaryHandle: string | null;
  startForFreeLabel: string;
};

export default function HomeHeader({
  primaryHandle,
  startForFreeLabel,
}: HomeHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-1 mx-auto max-w-7xl py-4 px-4">
      <Logo />
      <aside className="flex items-center gap-1">
        <SignedOut>
          <Button
            variant={"brand"}
            size={"lg"}
            className={"text-sm md:rounded-xl md:h-10 md:px-4"}
            {...getUmamiEventAttributes(UMAMI_EVENTS.auth.signIn.start, {
              [UMAMI_PROP_KEYS.ctx.source]: "home_cta",
            })}
          >
            <LocalizedLink to={"/sign-in"}>
              {startForFreeLabel}
            </LocalizedLink>
          </Button>
        </SignedOut>
        <SignedIn>
          <UserButton primaryHandle={primaryHandle} />
        </SignedIn>
        <Separator
          orientation="vertical"
          className={
            "my-1.5 rounded-full data-[orientation=vertical]:bg-muted data-[orientation=vertical]:w-0.5"
          }
        />
        <nav className="flex items-center justify-end gap-1">
          <LocaleSwitcher />
        </nav>
      </aside>
    </header>
  );
}
