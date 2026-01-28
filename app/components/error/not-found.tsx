import { Link } from "react-router";
import { Button } from "../ui/button";

export default function NotFound() {
  return (
			<section className="flex h-full flex-col items-center justify-center">
				<div className="size-96">
					<img src="/cat-blunge.png" alt="404" className="h-full w-full object-cover" />
				</div>
				<div className="flex flex-col items-center gap-8">
					<div className="text-sm/relaxed">It seems you got a little bit lost...</div>
					<Button size={"lg"} className={"h-10 rounded-xl px-6 text-sm"} render={<Link to="/">Go home</Link>} />
				</div>
			</section>
		);
}
