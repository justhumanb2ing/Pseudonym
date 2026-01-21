import { SignOutButton, useUser } from "@clerk/react-router";
import { IconLogout } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { getUmamiEventAttributes } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import { Skeleton } from "../ui/skeleton";

export default function UserDropdown() {
	const { user, isLoaded } = useUser();

	if (!isLoaded) {
		return <Skeleton className="h-8 w-full rounded-lg" />;
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
					<Button variant="ghost" size={"sm"} className="flex w-full justify-start gap-2 rounded-lg px-2 py-4 hover:bg-accent">
						<Avatar size="sm">
							<AvatarImage src={user.imageUrl} alt={name} />
							<AvatarFallback>{fallback}</AvatarFallback>
						</Avatar>
						<span className="max-w-[150px] truncate font-medium text-sm group-data-[collapsible=icon]:hidden">
							{name || user.username || user.primaryEmailAddress?.emailAddress}
						</span>
					</Button>
				}
			></DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				<SignOutButton redirectUrl={`/`}>
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
									<div>
										<IconLogout className="size-4" />
										<span>Log out</span>
									</div>
								}
							></Button>
						}
					></DropdownMenuItem>
				</SignOutButton>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
