import { Link } from "react-router";
import { Button } from "../ui/button";

interface UserButtonProps {
	label: string;
}

export default function UserButton({ label }: UserButtonProps) {
	return (
		<Button size={"lg"} variant={"brand"} className={"px-12 text-base/relaxed"}>
			<Link prefetch="viewport" to="/sign-in">
				{label}
			</Link>
		</Button>
	);
}
