import { useUser } from "@clerk/react-router";
import { LocalizedLink } from "@/components/i18n/localized-link";
import { Button } from "../ui/button";

interface UserButtonProps {
	label: string;
}

export default function UserButton({ label }: UserButtonProps) {
	const { isSignedIn } = useUser();

	return (
		<Button size={"lg"} variant={"brand"} className={"px-12 text-base/relaxed"}>
			<LocalizedLink prefetch="viewport" to={isSignedIn ? `/studio/${label}` : "/sign-in"}>
				{label}
			</LocalizedLink>
		</Button>
	);
}
