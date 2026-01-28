import { useUser } from "@clerk/react-router";
import { Spinner } from "@/components/ui/spinner";

export default function HomeHeader() {
	const { isLoaded } = useUser();

	if (!isLoaded) return <Spinner />;

	return (
		<header className="mx-auto flex max-w-7xl items-center justify-between gap-1 px-4 py-4">
		</header>
	);
}
