import { LocalizedLink } from "@/components/i18n/localized-link";
import { Button } from "../ui/button";

interface UserButtonProps {
	label: string;
}

export default function UserButton({ label }: UserButtonProps) {
	return (
		<Button size={"lg"} variant={"brand"} className={"px-12 text-base/relaxed"}>
			<LocalizedLink prefetch="viewport" to="/sign-in">
				{label}
			</LocalizedLink>
		</Button>
	);
}
