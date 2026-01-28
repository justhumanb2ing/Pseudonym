import { Link } from "react-router";

export default function Logo() {
	return (
		<div className="size-12">
			<Link to="/" className="font-medium text-xl tracking-tighter sm:text-3xl">
				<img src="/logo.png" alt="logo" className="h-full w-full object-cover" />
			</Link>
		</div>
	);
}
