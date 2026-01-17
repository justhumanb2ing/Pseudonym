import { ThemeProvider } from "next-themes";
import type React from "react";
import { useEffect, useState } from "react";
import { IntlayerProvider } from "react-intlayer";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import { useI18nHTMLAttributes } from "./hooks/use-i18n-html-attributes";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
	useI18nHTMLAttributes();

	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return null;

	return (
		<IntlayerProvider>
			<ToastProvider position="bottom-center" timeout={5000}>
				<AnchoredToastProvider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						{children}
					</ThemeProvider>
				</AnchoredToastProvider>
			</ToastProvider>
		</IntlayerProvider>
	);
}
