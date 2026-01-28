import { IconLogout } from "@tabler/icons-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth.client";
import { getUmamiEventAttributes } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import { Skeleton } from "../ui/skeleton";

export default function UserDropdown() {
	const {
		data: session,
		isPending, //loading state
	} = authClient.useSession();
	const user = session?.user;
	const [isSigningOut, setIsSigningOut] = useState(false);

	if (isPending) {
		return <Skeleton className="h-8 w-full rounded-lg" />;
	}

	if (!user) {
		return null;
	}

	const displayName = user.name?.trim() || user.email || user.id;
	const fallback = (displayName ? displayName.charAt(0) : "U").toUpperCase();

	const handleSignOut = async () => {
		if (isSigningOut) return;

		setIsSigningOut(true);
		try {
			await authClient.signOut();
			if (typeof window !== "undefined") {
				window.location.assign("/");
			}
		} finally {
			setIsSigningOut(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" size={"sm"} className="flex w-full justify-start gap-2 rounded-lg px-2 py-4 hover:bg-accent">
						<Avatar size="sm">
							<AvatarImage src={user.image || undefined} alt={displayName} />
							<AvatarFallback>{fallback}</AvatarFallback>
						</Avatar>
						<span className="max-w-[150px] truncate font-medium text-sm group-data-[collapsible=icon]:hidden">{displayName}</span>
					</Button>
				}
			></DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
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
							disabled={isSigningOut}
							onClick={handleSignOut}
							render={
								<div>
									<IconLogout className="size-4" />
									<span>Log out</span>
								</div>
							}
						></Button>
					}
				></DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
