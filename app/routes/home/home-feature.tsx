import { motion } from "motion/react";
import { TextAnimate } from "@/components/effects/text-animate";

export default function HomeFeature() {
	const textAnimationDuration = 2.5;

	return (
		<section className="relative flex min-h-dvh w-full flex-col-reverse items-center justify-between gap-8 overflow-hidden px-8 py-20 xl:h-full xl:flex-row xl:justify-center xl:gap-60 xl:py-20">
			<aside className="flex min-h-full shrink-0 items-center justify-center overflow-hidden rounded-[36px] border-[0.5px] shadow-float xl:rounded-[64px]">
				<video className="object-cover" preload="metadata" playsInline muted loop autoPlay>
					<source src="/landing/real-use.webm" type="video/webm" />
					<source src="/landing/real-use.mp4" type="video/mp4" />
				</video>
			</aside>
			<aside className="space-y-5 text-center md:text-left">
				<TextAnimate
					animation="fadeIn"
					by="word"
					as="p"
					className="w-full max-w-lg font-black text-3xl sm:text-4xl xl:max-w-2xl xl:text-5xl"
					once
					duration={textAnimationDuration}
				>
					{`Photos Videos Links Maps`}
				</TextAnimate>
				<motion.div
					className="text-lg sm:text-xl xl:text-2xl"
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut", delay: textAnimationDuration + 0.9 }}
				>
					No matter what it is, show yourself through everything.
				</motion.div>
			</aside>
		</section>
	);
}
