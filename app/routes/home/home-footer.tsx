import BuyMeCoffee from "@/components/effects/buy-me-coffee";
import LocaleSelector from "@/components/i18n/locale-selector";
import { LocalizedLink } from "@/components/i18n/localized-link";

// TODO: 하드코딩 값 변경
export default function HomeFooter() {
	return (
		<footer className="relative h-[600px] overflow-hidden p-4">
			<div className="h-full rounded-xl border bg-foreground px-6 pt-12 pb-4 text-white lg:px-20 lg:pt-28">
				<div className="container mx-auto flex h-full flex-col justify-between lg:flex-row">
					<aside className="flex flex-col gap-4">
						<div className="font-black text-7xl uppercase tracking-widest">VENUS</div>
						<div className="text-secondary">
							<p className="text-sm italic">Built to deliver a creator-first editing experience.</p>
							<p className="text-sm italic">
								Designed by <span className="cursor-pointer font-medium underline">Justhumanbeing</span>
							</p>
						</div>
						<div className="flex grow flex-col justify-between gap-8 text-sm lg:pb-16">
							<ul className="flex flex-row items-center gap-6">
								<li className="underline-offset-2 hover:underline">
									<LocalizedLink to={"/sign-in"}>Sign In</LocalizedLink>
								</li>
								<li className="underline-offset-2 hover:underline">
									<LocalizedLink to={"/changelog"}>Changelog</LocalizedLink>
								</li>
								<li className="underline-offset-2 hover:underline">
									<LocalizedLink to={"/feedback"}>Feedback</LocalizedLink>
								</li>
								<li className="underline-offset-2 hover:underline">
									<a href="https://github.com/justhumanb2ing">Github</a>
								</li>
							</ul>
							<div className="flex flex-col gap-4">
								<div className="space-y-1">
									<p className="font-medium">Contact</p>
									<div className="flex w-fit flex-col font-light text-secondary/60">
										<a href="mailto:justhumanb2ing@gmail.com">justhumanb2ing@gmail.com</a>
									</div>
								</div>
								<div className="flex flex-col justify-between gap-2">
									<LocaleSelector />
									<div>
										<p className="h-full text-muted-foreground text-xs/relaxed">2026 Venus. All rights reserved.</p>
									</div>
								</div>
							</div>
						</div>
					</aside>

					<aside className="flex items-end justify-end lg:items-center">
						<div className="justify-items-end">
							<BuyMeCoffee
								coffeeHref="https://www.buymeacoffee.com/justhumanb2ing"
								classname="w-60 h-40 flex items-center justify-center m-0 lg:size-80"
								iconClassName="w-20 h-20 text-yellow-500 lg:h-44 lg:w-40"
							/>
						</div>
					</aside>
				</div>
			</div>
		</footer>
	);
}
