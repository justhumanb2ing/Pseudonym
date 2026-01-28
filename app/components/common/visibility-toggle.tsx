import { useEffect, useRef, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase.client";
import { getUmamiEventAttributes, trackUmamiEvent } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import { Button } from "../ui/button";

interface VisibilityToggleProps {
	pageId: string;
	isPublic: boolean;
}

export default function VisibilityToggle({ pageId, isPublic: initialIsPublic }: VisibilityToggleProps) {
	const [isPublic, setIsPublic] = useState(initialIsPublic);
	const [isSaving, setIsSaving] = useState(false);
	const supabase = getSupabaseClient();
	const isPublicRef = useRef(initialIsPublic);

	useEffect(() => {
		setIsPublic(initialIsPublic);
		isPublicRef.current = initialIsPublic;
	}, [initialIsPublic]);

	const handleToggle = async () => {
		if (isSaving) {
			return;
		}

		const nextIsPublic = !isPublicRef.current;
		setIsPublic(nextIsPublic);
		isPublicRef.current = nextIsPublic;
		setIsSaving(true);

		try {
			const { error } = await (await supabase).from("pages").update({ is_public: nextIsPublic }).eq("id", pageId);

			if (error) {
				setIsPublic(!nextIsPublic);
				isPublicRef.current = !nextIsPublic;
				trackUmamiEvent(
					UMAMI_EVENTS.feature.profileVisibility.error,
					{
						[UMAMI_PROP_KEYS.ctx.pageId]: pageId,
						[UMAMI_PROP_KEYS.ctx.action]: nextIsPublic ? "public" : "private",
						[UMAMI_PROP_KEYS.ctx.errorCode]: "update_failed",
					},
					{
						dedupeKey: `visibility-error:${pageId}`,
						ttlMs: 2000,
					},
				);
				return;
			}

			trackUmamiEvent(
				UMAMI_EVENTS.feature.profileVisibility.success,
				{
					[UMAMI_PROP_KEYS.ctx.pageId]: pageId,
					[UMAMI_PROP_KEYS.ctx.action]: nextIsPublic ? "public" : "private",
				},
				{
					dedupeKey: `visibility-success:${pageId}:${nextIsPublic}`,
					ttlMs: 2000,
				},
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		// <Button
		//   type="button"
		//   size={"lg"}
		//   variant={"ghost"}
		//   className="group"
		//   onClick={handleToggle}
		//   disabled={isSaving}
		//   aria-pressed={isPublic}
		//   aria-busy={isSaving}
		// >
		//   <div className="relative w-full h-full flex overflow-hidden">
		//     <AnimatePresence initial={false} mode="sync">
		//       {isPublic ? (
		//         <motion.span
		//           key="public"
		//           className="absolute inset-0 flex justify-center items-center gap-1"
		//           initial={{ y: 24, opacity: 0 }}
		//           animate={{ y: 0, opacity: 1 }}
		//           exit={{ y: -24, opacity: 0 }}
		//           transition={{ duration: 0.25, ease: "easeOut" }}
		//         >
		//           {/* <LockOpenIcon className="size-4" /> */}
		//           <span className="text-xs font-medium">Public</span>
		//         </motion.span>
		//       ) : (
		//         <motion.span
		//           key="private"
		//           className="absolute inset-0 flex items-center justify-center gap-1"
		//           initial={{ y: 24, opacity: 0 }}
		//           animate={{ y: 0, opacity: 1 }}
		//           exit={{ y: -24, opacity: 0 }}
		//           transition={{ duration: 0.25, ease: "easeOut" }}
		//         >
		//           {/* <LockIcon className="size-4" /> */}
		//           <span className="text-xs font-medium">Private</span>
		//         </motion.span>
		//       )}
		//     </AnimatePresence>
		//   </div>
		//   <span className="sr-only">
		//     {isPublic ? "Public page" : "Private page"}
		//   </span>
		// </Button>
		<Button
			type="button"
			variant={"ghost"}
			size={"lg"}
			onClick={handleToggle}
			disabled={isSaving}
			aria-pressed={isPublic}
			aria-busy={isSaving}
			className={"w-full justify-start gap-2 rounded-lg py-6 text-base"}
			{...getUmamiEventAttributes(UMAMI_EVENTS.feature.profileVisibility.toggle, {
				[UMAMI_PROP_KEYS.ctx.pageId]: pageId,
				[UMAMI_PROP_KEYS.ctx.action]: isPublic ? "make_private" : "make_public",
			})}
		>
			{isPublic ? (
				<div className="flex w-full flex-col items-start gap-1">
					<p>Public</p>
					<p className="font-normal text-muted-foreground text-xs">Viewable to everyone</p>
				</div>
			) : (
				<div className="flex w-full flex-col items-start gap-1">
					<p>Private</p>
					<p className="font-normal text-muted-foreground text-xs">Only you can view</p>
				</div>
			)}
		</Button>
	);
}
