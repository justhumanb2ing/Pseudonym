import { AnimatePresence, motion } from "motion/react";
import { createContext, type ReactNode, type RefObject, useContext, useEffect, useId, useRef, useState } from "react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export type ExpandableCardItem<T = unknown> = {
	id: string;
	type: string;
	data: T;
};

export type ExpandableCardView = {
	title?: string;
	titleClassName?: string;
	expandedTitleClassName?: string;
	description?: string;
	imageUrl?: string;
	ctaContent?: ReactNode;
	ctaClassName?: string;
	content?: ReactNode | (() => ReactNode);
};

export type ExpandableCardRenderer<T = unknown> = {
	summary: (item: ExpandableCardItem<T>) => ExpandableCardView;
	expanded: (item: ExpandableCardItem<T>) => ExpandableCardView;
};

type ExpandableCardProps<T> = {
	item: ExpandableCardItem<T>;
	renderers: Record<string, ExpandableCardRenderer<T>>;
	fallbackRenderer?: ExpandableCardRenderer<T>;
	summaryTrailing?: ReactNode;
	summaryClassName?: string;
	enableExpand?: boolean;
};

type ExpandableCardContextValue = {
	close: () => void;
	activeId: string | null;
};

const ExpandableCardContext = createContext<ExpandableCardContextValue | null>(null);

export function useExpandableCardContext() {
	return useContext(ExpandableCardContext);
}

export function ExpandableCard<T>({
	item,
	renderers,
	fallbackRenderer,
	summaryTrailing,
	summaryClassName,
	enableExpand = true,
}: ExpandableCardProps<T>) {
	const [active, setActive] = useState<ExpandableCardItem<T> | null>(null);
	const ref = useRef<HTMLDivElement | null>(null);
	const id = useId();
	const isSectionItem = item.type === "section";
	const isActiveSectionItem = active?.type === "section";

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setActive(null);
			}
		}

		if (active && typeof active === "object") {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [active]);

	useOutsideClick(ref as RefObject<HTMLDivElement>, () => setActive(null));

	useEffect(() => {
		if (active?.id === item.id && active !== item) {
			setActive(item);
		}
	}, [active, item]);

	const getRenderer = (itemType: string): ExpandableCardRenderer<T> => {
		const renderer = renderers[itemType];
		if (renderer) {
			return renderer;
		}
		return (
			fallbackRenderer ?? {
				summary: (fallbackItem) => ({ title: fallbackItem.type }),
				expanded: () => ({ content: null }),
			}
		);
	};

	const activeExpanded = active ? getRenderer(active.type).expanded(active) : null;
	const summary = getRenderer(item.type).summary(item);
	const contextValue: ExpandableCardContextValue = {
		close: () => setActive(null),
		activeId: active?.id ?? null,
	};

	return (
		<ExpandableCardContext.Provider value={contextValue}>
			<AnimatePresence>
				{active && typeof active === "object" && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-10 h-full w-full bg-black/10"
					/>
				)}
			</AnimatePresence>
			<AnimatePresence>
				{active && typeof active === "object" ? (
					<div className="fixed inset-0 z-100 grid place-items-center">
						<motion.div
							layoutId={`card-${active.id}-${id}`}
							ref={ref}
							className="relative flex h-full w-full max-w-full flex-col overflow-hidden bg-white md:h-fit md:max-h-[90%] md:max-w-lg md:rounded-3xl dark:bg-neutral-900"
						>
							<div className="flex grow flex-col gap-4">
								<div className="flex items-center justify-between gap-6 p-4 px-6">
									<div className="flex min-w-0 items-center gap-4">
										{activeExpanded?.imageUrl ? (
											<motion.div layoutId={`image-${active.id}-${id}`} className="size-8 shrink-0 md:size-10">
												<img src={activeExpanded.imageUrl} alt={activeExpanded.title} className="h-full w-full object-cover" />
											</motion.div>
										) : null}
										<div className="flex min-w-0 flex-col">
											<motion.h3
												layoutId={`title-${active.id}-${id}`}
												className={cn(
													"w-full truncate font-medium",
													isActiveSectionItem ? "text-xl" : "text-sm md:text-base",
													activeExpanded?.expandedTitleClassName,
												)}
											>
												{activeExpanded?.title}
											</motion.h3>
											{activeExpanded?.description ? (
												<motion.p layoutId={`description-${active.id}-${id}`} className="truncate text-muted-foreground text-xs/relaxed">
													{activeExpanded.description}
												</motion.p>
											) : null}
										</div>
									</div>

									{activeExpanded?.ctaContent ? (
										<motion.div
											layoutId={`button-${active.id}-${id}`}
											className="flex shrink-0 items-center"
											onClick={(event) => event.stopPropagation()}
											onPointerDown={(event) => event.stopPropagation()}
										>
											{activeExpanded.ctaContent}
										</motion.div>
									) : null}
								</div>
								{activeExpanded?.content ? (
									<div className="relative flex h-full min-h-0 flex-col gap-1 px-4 pb-6 md:pb-4">
										<motion.div
											layout
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="flex flex-1 overflow-auto p-2 pb-0"
										>
											{typeof activeExpanded.content === "function" ? activeExpanded.content?.() : activeExpanded.content}
										</motion.div>
										<div className="w-full px-2">
											<Button variant={"ghost"} size={"lg"} className="w-full flex-1 basis-0" onClick={() => setActive(null)}>
												Cancel
											</Button>
										</div>
									</div>
								) : null}
							</div>
						</motion.div>
					</div>
				) : null}
			</AnimatePresence>
			<motion.div
				layoutId={`card-${item.id}-${id}`}
				onClick={enableExpand ? () => setActive(item) : undefined}
				className={cn(
					"flex min-w-0 flex-row items-center justify-between gap-3 rounded-xl bg-background p-3",
					enableExpand ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800" : "cursor-default",
					summaryClassName,
				)}
			>
				<div className="flex min-w-0 flex-row items-center gap-4">
					{summaryTrailing ? <div className="shrink-0">{summaryTrailing}</div> : null}
					{summary.imageUrl ? (
						<motion.div layoutId={`image-${item.id}-${id}`} className="size-8 md:size-10">
							<img
								width={100}
								height={100}
								src={summary.imageUrl}
								alt={summary.title}
								className="h-full w-full rounded-lg object-cover object-top"
							/>
						</motion.div>
					) : null}
					<div className="min-w-0 flex-1 overflow-hidden">
						<motion.h3
							layoutId={`title-${item.id}-${id}`}
							className={cn("w-full font-medium", isSectionItem ? "text-lg" : "text-sm md:text-base", summary.titleClassName ?? "truncate")}
						>
							{summary.title}
						</motion.h3>
						{summary.description ? (
							<motion.p layoutId={`description-${item.id}-${id}`} className="truncate text-muted-foreground text-xs/relaxed">
								{summary.description}
							</motion.p>
						) : null}
					</div>
				</div>
				{summary.ctaContent ? (
					<div className="flex shrink-0 items-center gap-2">
						{summary.ctaContent ? (
							<motion.div
								layoutId={`button-${item.id}-${id}`}
								className={cn("flex shrink-0 items-center", summary.ctaClassName)}
								onClick={(event) => event.stopPropagation()}
								onPointerDown={(event) => event.stopPropagation()}
							>
								{summary.ctaContent}
							</motion.div>
						) : null}
					</div>
				) : null}
			</motion.div>
		</ExpandableCardContext.Provider>
	);
}
