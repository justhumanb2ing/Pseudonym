import { motion } from "motion/react";
import { useIntlayer } from "react-intlayer";
import UserButton from "@/components/auth/user-button";
export default function HomeHero() {
	const content = useIntlayer("home-hero");

	return (
		<section className="relative flex h-dvh items-center justify-center overflow-hidden pt-32 pb-20">
			{/* Main Content */}
			<div className="relative z-10 mx-auto max-w-4xl px-6">
				{/* Headline */}
				<motion.div
					className="text-center"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					<h1 className="mb-6 font-extrabold text-[clamp(2.5rem,7vw,4.5rem)] text-foreground leading-[1.1] tracking-tight">
						{content.headline1}
						<br />
						<span className="text-brand">{content.headline2}</span>
					</h1>
					<p className="mx-auto mb-10 max-w-lg text-lg text-muted-foreground leading-relaxed">{content.description}</p>

					{/* CTA Buttons */}
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<UserButton label={content.ctaPrimary.value} />
						</motion.div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
