import { generateMeta } from "@forge42/seo-tools/remix/metadata";
import { breadcrumbs } from "@forge42/seo-tools/structured-data/breadcrumb";
import type { MetaFunction } from "react-router";
import { metadataConfig } from "@/config/metadata";
import { useFeedbackForm } from "@/hooks/feedback/use-feedback-form";
import { getLocalizedPath } from "@/utils/localized-path";
import FeedbackForm from "./feedback/_feedback-form";

export { action } from "@/service/feedback.action";

const buildUrl = (lang: string | undefined, pathname: string) => new URL(getLocalizedPath(lang, pathname), metadataConfig.url).toString();

const defaultImageUrl = new URL(metadataConfig.defaultImage, metadataConfig.url).toString();

export const meta: MetaFunction = ({ params }) => {
	const feedbackUrl = buildUrl(params.lang, "/feedback");

	return generateMeta(
		{
			title: "Feedback",
			description: "Share feedback or report issues.",
			url: feedbackUrl,
			image: defaultImageUrl,
			siteName: metadataConfig.title,
			twitterCard: metadataConfig.twitterCard,
		},
		[
			{
				"script:ld+json": breadcrumbs(feedbackUrl, ["Home", "Feedback"]),
			},
		],
	);
};

export default function IssueRoute() {
	const { fetcher, isSubmitting, fieldErrors, formError, senderEmailErrors, subjectErrors, contentErrors } = useFeedbackForm();

	return (
		<main className="container mx-auto flex h-full max-w-2xl flex-col justify-center gap-6 p-4">
			<header className="font-medium text-xl">Report an issue or share feedback.</header>
			<FeedbackForm
				fetcher={fetcher}
				isSubmitting={isSubmitting}
				fieldErrors={fieldErrors}
				formError={formError}
				senderEmailErrors={senderEmailErrors}
				subjectErrors={subjectErrors}
				contentErrors={contentErrors}
			/>
		</main>
	);
}
