import { LocalizedLink } from "../i18n/localized-link";

export default function Logo() {
	return (
		<div className="size-14">
			<LocalizedLink to={"/"} className="font-medium text-xl tracking-tighter sm:text-3xl">
				<img src="/logo.png" alt="logo" className="h-full w-full object-cover" />
			</LocalizedLink>
		</div>
	);
}
