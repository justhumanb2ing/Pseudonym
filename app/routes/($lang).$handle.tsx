import { Outlet } from "react-router";

export default function UserLayout() {
	return (
		<main className="h-full w-full bg-surface">
			<Outlet />
		</main>
	);
}
