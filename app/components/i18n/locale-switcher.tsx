import { getLocaleName, getLocalizedUrl, getPathWithoutLocale } from "intlayer";
import { AnimatePresence, motion } from "motion/react";
import { useIntlayer, useLocale } from "react-intlayer";
import { useLocation, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function LocaleSwitcher() {
	const { localeLabel } = useIntlayer("locale");
	const { pathname } = useLocation();
	const navigate = useNavigate();

	const { availableLocales, locale, setLocale } = useLocale({
		isCookieEnabled: false,
	});

	const pathWithoutLocale = getPathWithoutLocale(pathname);
	const fallbackLocale = availableLocales[0];
	const currentLocale = locale ?? fallbackLocale;
	const currentLabel = currentLocale ? getLocaleName(currentLocale) : localeLabel.value;

	const nextLocale = availableLocales.find((localeItem) => localeItem !== currentLocale) ?? currentLocale;

	const handleToggle = () => {
		if (!nextLocale || nextLocale === currentLocale) return;

		setLocale(nextLocale);
		navigate(getLocalizedUrl(pathWithoutLocale, nextLocale));
	};

	return (
		<Tooltip>
			<TooltipTrigger
				render={(props) => (
					<Button
						{...props}
						type="button"
						variant={"ghost"}
						className="group h-9.5 w-16 overflow-hidden rounded-md bg-white dark:bg-black"
						onClick={(event) => {
							props.onClick?.(event);
							if (event.defaultPrevented) return;
							handleToggle();
						}}
						aria-label={localeLabel.value}
					>
						<span className="sr-only">{`${localeLabel.value}: ${currentLabel}`}</span>
						<span className="relative flex h-6 w-full items-center justify-center overflow-hidden">
							<AnimatePresence initial={false} mode="sync">
								<motion.span
									key={currentLocale ?? "locale"}
									className="absolute inset-0 flex items-center justify-center gap-2"
									initial={{ y: 24, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -24, opacity: 0 }}
									transition={{ duration: 0.25, ease: "easeOut" }}
								>
									{/* <TranslateIcon className="size-4" /> */}
									<span className="font-medium text-xs">{currentLabel}</span>
								</motion.span>
							</AnimatePresence>
						</span>
					</Button>
				)}
			/>
			<TooltipContent side="bottom" sideOffset={8}>
				{localeLabel.value}
			</TooltipContent>
		</Tooltip>
	);
}
