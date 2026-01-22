import { useUser } from "@clerk/react-router";
import LocaleSwitcher from "@/components/i18n/locale-switcher";
import { LocalizedLink } from "@/components/i18n/localized-link";
import { Spinner } from "@/components/ui/spinner";
import { getUmamiEventAttributes } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";

type HomeHeaderProps = {
	primaryHandle: string | null;
	startForFreeLabel: string;
};

export default function HomeHeader({ primaryHandle, startForFreeLabel }: HomeHeaderProps) {
	const { isSignedIn, isLoaded } = useUser();

	if (!isLoaded) return <Spinner />;

	return (
		<header className="mx-auto flex max-w-7xl items-center justify-between gap-1 px-4 py-4">
			{/* <Logo />
			<aside className="flex items-center gap-1">
				<Button
					variant={"brand"}
					size={"sm"}
					className={"rounded-lg text-sm md:h-10 md:rounded-xl md:px-4"}
					{...getUmamiEventAttributes(UMAMI_EVENTS.auth.signIn.start, {
						[UMAMI_PROP_KEYS.ctx.source]: "home_cta",
					})}
				>
					<LocalizedLink to={isSignedIn ? `/studio/${primaryHandle}` : "/sign-in"}>{startForFreeLabel}</LocalizedLink>
				</Button> */}
				<nav className="flex items-center justify-end gap-1">
					<LocaleSwitcher />
				</nav>
			{/* </aside> */}
		</header>
	);
}
