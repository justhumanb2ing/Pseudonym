import { ThemeProvider } from "next-themes";
import type React from "react";
import { useEffect, useState } from "react";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return null;

	return (
		<ToastProvider position="top-center" timeout={5000}>
			<AnchoredToastProvider>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</AnchoredToastProvider>
		</ToastProvider>
	);
}
