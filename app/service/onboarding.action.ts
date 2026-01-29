import { redirect } from "react-router";
import { z } from "zod";
import { auth } from "@/lib/auth.server";
import { getSupabaseServerClient } from "@/lib/supabase.server";
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

export async function action(args: Route.ActionArgs) {
	const session = await auth.api.getSession({
		headers: args.request.headers,
	});
	const userId = session?.user?.id;
	if (!userId) {
		throw redirect("/sign-in");
	}

	const onboardingComplete = session?.user?.userMetadata?.onboardingComplete === true
	if (onboardingComplete) {
		throw redirect("/");
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

	const supabase = await getSupabaseServerClient(args, { session });
	const profileImageUrl = session?.user?.image ?? null;
	const { error } = await supabase.rpc("create_page", {
		p_handle: `@${handle}`,
		p_title: title,
		p_description: description ?? undefined,
		p_image_url: profileImageUrl ?? undefined,
	});
	if (error) {
		return { formError: error.message };
	}

	const ctx = await auth.$context;
	const nextUserMetadata = {
		...(session?.user?.userMetadata ?? {}),
		onboardingComplete: true,
	};
	await ctx.internalAdapter.updateUser(userId, {
		userMetadata: nextUserMetadata,
	});

	// 쿠키는 클라이언트에서 navigate 시점에 갱신 (complete 단계를 보여주기 위해)
	return {
		success: true,
		handle: `@${handle}`,
	} satisfies ActionData;
}
