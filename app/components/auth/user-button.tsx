import { useUser } from "@clerk/react-router";
import { LocalizedLink } from "@/components/i18n/localized-link";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

interface UserButtonProps {
	primaryHandle: string | null;
}

export default function UserButton({ primaryHandle }: UserButtonProps) {
	const { user, isLoaded } = useUser();
	const _name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

	if (!isLoaded) return <Spinner />;

	return (
		<Button size={"lg"} variant={"link"}>
			<LocalizedLink prefetch="viewport" to={`/studio/${primaryHandle}`}>
				Wave to Profile
			</LocalizedLink>
		</Button>
	);
}
