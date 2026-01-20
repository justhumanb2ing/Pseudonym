import { getLocalizedUrl, type LocalesValues } from "intlayer";
import { useLocale } from "react-intlayer";
import { useLocalizedNavigate } from "@/hooks/use-localized-navigate";
import { cn } from "@/lib/utils";

const LOCALE_LINKS = [
	{ label: "English", value: "en" },
	{ label: "한국어", value: "ko" },
] satisfies ReadonlyArray<{ label: string; value: LocalesValues }>;

export default function LocaleSelector() {
	const { availableLocales, locale, setLocale } = useLocale({
		isCookieEnabled: false,
	});
	const navigate = useLocalizedNavigate();
	const fallbackLocale = availableLocales[0];
	const currentLocale = locale ?? fallbackLocale;

	const availableLinks =
		availableLocales.length === 0 ? LOCALE_LINKS : LOCALE_LINKS.filter((link) => availableLocales.includes(link.value));

	const handleLocaleSelect = (targetLocale: LocalesValues) => {
		if (!targetLocale || targetLocale === currentLocale) return;

		setLocale(targetLocale);
		navigate(getLocalizedUrl("/", targetLocale));
	};

	return (
		<nav aria-label="Locale selector">
			<ul className="flex items-center gap-4">
				{availableLinks.map(({ label, value }) => {
					const isCurrent = value === currentLocale;

					return (
						<li key={value}>
							<a
								href={getLocalizedUrl("/", value)}
								aria-current={isCurrent ? "page" : undefined}
								className={cn(
									"rounded-full font-semibold text-xs hover:underline",
									// isCurrent
									// 	? "bg-foreground text-white focus-visible:outline-foreground"
									// 	: "bg-muted text-foreground hover:bg-muted/80 focus-visible:outline-muted",
								)}
								onClick={(event) => {
									event.preventDefault();
									handleLocaleSelect(value);
								}}
							>
								{label}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
