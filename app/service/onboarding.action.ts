import { clerkClient, getAuth } from "@clerk/react-router/server";
import { redirect } from "react-router";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getLocalizedPath } from "@/utils/localized-path";
import type { Route } from "../routes/+types/($lang)._auth.onboarding";

export const onboardingSchema = z.object({
	handle: z
		.string()
		.trim()
		.toLowerCase()
		.regex(/^[a-z0-9]+$/, "Only lowercase letters and numbers are allowed."),
	title: z.string().trim().min(1, "Title is required."),
	description: z.string().trim().nullable(),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export type ActionData = {
	formError?: string;
	fieldErrors?: Partial<Record<keyof OnboardingFormValues, string>>;
	success?: boolean;
	handle?: string;
};

export async function action(args: Route.ActionArgs) {
	const auth = await getAuth(args);
	if (!auth.userId) {
		throw redirect(getLocalizedPath(args.params.lang, "/sign-in"));
	}

	const formData = await args.request.formData();
	const parsed = onboardingSchema.safeParse({
		handle: formData.get("handle"),
		title: formData.get("title"),
		description: formData.get("description"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			fieldErrors: {
				handle: tree.properties?.handle?.errors[0],
				title: tree.properties?.title?.errors[0],
				description: tree.properties?.description?.errors[0],
			},
		} satisfies ActionData;
	}

	const { handle, title, description } = parsed.data;

	const supabase = await getSupabaseServerClient(args);
	const { error } = await supabase.rpc("create_page", {
		p_handle: `@${handle}`,
		p_title: title,
		p_description: description ?? undefined,
	});

	if (error) {
		return { formError: error.message };
	}

	const clerk = clerkClient(args);

	await clerk.users.updateUser(auth.userId, {
		publicMetadata: {
			onboardingComplete: true,
		},
	});

	return {
		success: true,
		handle: `@${handle}`,
	} satisfies ActionData;
}
