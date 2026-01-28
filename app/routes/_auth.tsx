import { Outlet } from "react-router";

export default function ProtectedLayout() {
	return (
		<main className="flex h-full items-center justify-center">
			<Outlet />
		</main>
	);
}
