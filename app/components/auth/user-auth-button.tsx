import { SignInButton, SignOutButton, useUser } from "@clerk/react-router";
import { useLocation } from "react-router";
import { getUmamiEventAttributes } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function UserAuthButton() {
	const { isSignedIn, isLoaded } = useUser();
	const location = useLocation();
	const signInLabel = "Sign in";
	const signOutLabel = "Sign out";

	if (!isLoaded) return <Spinner />;

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					isSignedIn ? (
						<SignOutButton redirectUrl={`${location.pathname}${location.search}${location.hash}`}>
							<Button
								variant={"ghost"}
								size={"lg"}
								className={"text-xs"}
								{...getUmamiEventAttributes(UMAMI_EVENTS.auth.signOut.click, {
									[UMAMI_PROP_KEYS.ctx.source]: "bottom_action_bar",
								})}
							>
								{signOutLabel}
							</Button>
						</SignOutButton>
					) : (
						<SignInButton forceRedirectUrl={`${location.pathname}${location.search}${location.hash}`}>
							<Button
								variant={"ghost"}
								size={"lg"}
								className={"text-xs"}
								{...getUmamiEventAttributes(UMAMI_EVENTS.auth.signIn.start, {
									[UMAMI_PROP_KEYS.ctx.source]: "bottom_action_bar",
								})}
							>
								{signInLabel}
							</Button>
						</SignInButton>
					)
				}
			/>
			<TooltipContent side="bottom" sideOffset={8}>
				{isSignedIn ? signOutLabel : signInLabel}
			</TooltipContent>
		</Tooltip>
	);
}
