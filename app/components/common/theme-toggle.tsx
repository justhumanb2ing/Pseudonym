import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
	duration?: number;
	iconSize?: string;
}

export const ThemeToggle = ({ className, duration = 400, iconSize, ...props }: ThemeTogglerProps) => {
	const { theme, setTheme } = useTheme();
	const buttonRef = useRef<HTMLButtonElement>(null);
	const themeTooltip = "Theme";

	const toggleTheme = useCallback(async () => {
		if (!buttonRef.current) return;

		await document.startViewTransition(() => {
			flushSync(() => {
				setTheme((prev) => (prev === "dark" ? "light" : "dark"));
			});
		}).ready;

		const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
		const x = left + width / 2;
		const y = top + height / 2;
		const maxRadius = Math.hypot(Math.max(left, window.innerWidth - left), Math.max(top, window.innerHeight - top));

		document.documentElement.animate(
			{
				clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
			},
			{
				duration,
				easing: "ease-in-out",
				pseudoElement: "::view-transition-new(root)",
			},
		);
	}, [duration, setTheme]);

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<button
						ref={buttonRef}
						onClick={toggleTheme}
						className={cn("rounded-md bg-white p-2 hover:bg-muted dark:bg-black dark:hover:bg-muted/50", className)}
						{...props}
					>
						{theme === "dark" ? <IconSun className={iconSize} /> : <IconMoonStars className={iconSize} />}
						<span className="sr-only">Toggle theme</span>
					</button>
				}
			/>
			<TooltipContent side="bottom" sideOffset={8}>
				<p>{themeTooltip}</p>
			</TooltipContent>
		</Tooltip>
	);
};
