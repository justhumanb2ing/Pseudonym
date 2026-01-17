import { LocalizedLink } from "@/components/i18n/localized-link";

export default function HomeFooter() {
	return (
		<footer className="my-20 flex h-[400px] flex-col items-center justify-center gap-20 pb-32 text-muted-foreground">
			<div className="space-y-4">
				<div className="flex justify-center font-medium text-3xl tracking-tighter">beyondthewave</div>
				<div className="text-center text-sm">Designed by Justhumanbeing</div>
			</div>
			<div>
				<ul className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
					<li className="underline-offset-2 hover:underline">
						<LocalizedLink to={"/sign-in"}>Sign In</LocalizedLink>
					</li>
					<li className="underline-offset-2 hover:underline">
						<LocalizedLink to={"/changelog"}>Changelog</LocalizedLink>
					</li>
					<li className="underline-offset-2 hover:underline">
						<LocalizedLink to={"/feedback"}>Feedback</LocalizedLink>
					</li>
				</ul>
			</div>
			<div>
				<a href="https://www.buymeacoffee.com/justhumanb2ing" target="_blank" rel="noopener noreferrer">
					<img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=justhumanb2ing&button_colour=FFDD00&font_colour=000000&font_family=Comic&outline_colour=000000&coffee_colour=ffffff" />
				</a>
			</div>
		</footer>
	);
}
