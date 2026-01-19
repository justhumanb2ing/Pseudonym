import type React from "react";

import { cn } from "@/lib/utils";

interface Props {
	className?: string;
	children: React.ReactNode;
}

const createTypography =
	(Tag: React.ElementType, baseClassName: string): React.FC<Props> =>
	({ className, children }) => <Tag className={cn(baseClassName, className)}>{children}</Tag>;

const H1 = createTypography("h1", "scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl");

const H2 = createTypography("h2", "scroll-m-20 pb-2 font-semibold text-3xl tracking-tight first:mt-0");

const H3 = createTypography("h3", "scroll-m-20 font-semibold text-2xl tracking-tight");

const H4 = createTypography("h4", "scroll-m-20 font-semibold text-xl tracking-tight");

const P = createTypography("p", "not-first:mt-6 leading-7");

const Blockquote = createTypography("blockquote", "mt-6 border-l-2 pl-6 italic");

const InlineCode: React.FC<Props> = ({ className, children }) => (
	<code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm", className)}>{children}</code>
);

const Lead = createTypography("p", "text-muted-foreground text-xl");

const Large = createTypography("div", "font-semibold text-lg");

const Muted: React.FC<Props> = ({ className, children }) => (
	<p className={cn("text-muted-foreground text-sm", className)}>{children}.</p>
);

const Text = { H1, H2, H3, H4, P, Lead, Large, Muted, Blockquote, InlineCode };

export { Text };
