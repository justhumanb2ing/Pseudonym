import { clerkClient, getAuth } from "@clerk/react-router/server";
import { redirect } from "react-router";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Route } from "../routes/+types/_auth.onboarding";

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

/**
 * Fetches the Clerk profile image URL for seeding the initial page.
 */
async function getClerkProfileImageUrl(args: Route.ActionArgs, userId: string) {
	const clerk = clerkClient(args);
	const user = await clerk.users.getUser(userId);
	return user.imageUrl ?? null;
}

export async function action(args: Route.ActionArgs) {
	const auth = await getAuth(args);
	if (!auth.userId) {
		throw redirect("/sign-in");
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
	const profileImageUrl = await getClerkProfileImageUrl(args, auth.userId);
	const { error } = await supabase.rpc("create_page", {
		p_handle: `@${handle}`,
		p_title: title,
		p_description: description ?? undefined,
		p_image_url: profileImageUrl ?? undefined,
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
