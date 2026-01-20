import { useNavigate } from "react-router";
import { Button } from "../ui/button";

export default function Forbidden() {
	const navigate = useNavigate();
	return (
		<section className="flex h-full flex-col items-center justify-center">
			<div className="size-96">
				<img src="/cat-blunge.png" alt="404" className="h-full w-full object-cover" />
			</div>
			<div className="flex flex-col items-center gap-8">
				<div className="text-sm/relaxed">Access may be restricted or the content may be private...</div>
				<Button size={"lg"} className={"h-10 rounded-xl px-6 text-sm"} onClick={() => navigate(-1)}>
					Go Back
				</Button>
			</div>
		</section>
	);
}
