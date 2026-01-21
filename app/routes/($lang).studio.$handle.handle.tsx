import { getAuth } from "@clerk/react-router/server";
import { useEffect, useRef, useState } from "react";
import { redirect, useFetcher, useOutletContext } from "react-router";
import type { StudioOutletContext } from "types/studio.types";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getSupabaseServerClient } from "@/lib/supabase";
import { formatPageHandle, HANDLE_PATTERN, handleSchema } from "@/service/pages/page-handle";
import { getLocalizedPath } from "@/utils/localized-path";
import type { Route } from "./+types/($lang).studio.$handle.handle";

type ActionData = {
	formError?: string;
	fieldErrors?: {
		handle?: string;
	};
};

const handleFormSchema = z.object({
	handle: handleSchema,
});

export async function action(args: Route.ActionArgs) {
	if (args.request.method !== "POST") {
		return new Response("Method not allowed.", { status: 405 });
	}

	const auth = await getAuth(args);
	if (!auth.userId) {
		throw redirect(getLocalizedPath(args.params.lang, "/sign-in"));
	}

	const { handle: currentHandle } = args.params;
	if (!currentHandle) {
		throw new Response("Not Found", { status: 404 });
	}

	const formData = await args.request.formData();
	const parsed = handleFormSchema.safeParse({
		handle: formData.get("handle"),
	});

	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);
		return {
			fieldErrors: {
				handle: tree.properties?.handle?.errors[0],
			},
		} satisfies ActionData;
	}

	const supabase = await getSupabaseServerClient(args);
	const { data: page, error: pageError } = await supabase
		.from("pages")
		.select("id, handle, owner_id")
		.eq("handle", currentHandle)
		.maybeSingle();

	if (pageError) {
		return { formError: pageError.message } satisfies ActionData;
	}

	if (!page) {
		throw new Response("Not Found", { status: 404 });
	}

	if (page.owner_id !== auth.userId) {
		throw new Response("Forbidden", { status: 403 });
	}

	const nextHandle = formatPageHandle(parsed.data.handle);
	if (nextHandle === page.handle) {
		return {
			fieldErrors: { handle: "Handle is unchanged." },
		} satisfies ActionData;
	}

	const { data: existingHandle, error: handleError } = await supabase
		.from("pages")
		.select("id")
		.eq("handle", nextHandle)
		.neq("id", page.id)
		.maybeSingle();

	if (handleError) {
		return { formError: handleError.message } satisfies ActionData;
	}

	if (existingHandle) {
		return {
			fieldErrors: { handle: "Handle already exists." },
		} satisfies ActionData;
	}

	const { error: updateError } = await supabase.from("pages").update({ handle: nextHandle }).eq("id", page.id);

	if (updateError) {
		return { formError: updateError.message } satisfies ActionData;
	}

	return redirect(getLocalizedPath(args.params.lang, `/studio/${nextHandle}/handle`));
}

export default function StudioSettingsHandleRoute() {
	const fetcher = useFetcher<ActionData>();
	const isSubmitting = fetcher.state !== "idle";
	const [actionData, setActionData] = useState<ActionData | undefined>(fetcher.data);
	const lastDataRef = useRef<ActionData | undefined>(fetcher.data);
	const { page } = useOutletContext<StudioOutletContext>();
	const currentHandle = page.handle.replace(/^@/, "");
	const handleErrors = actionData?.fieldErrors?.handle ? [{ message: actionData.fieldErrors.handle }] : undefined;

	useEffect(() => {
		if (fetcher.state === "submitting") {
			setActionData(undefined);
			lastDataRef.current = fetcher.data;
			return;
		}

		if (fetcher.data && fetcher.data !== lastDataRef.current) {
			setActionData(fetcher.data);
			lastDataRef.current = fetcher.data;
		}
	}, [fetcher.data, fetcher.state]);

	return (
		<section className="flex grow flex-col gap-6 p-2 px-4 pb-6">
			<main className="h-full rounded-2xl p-6">
				<div className="flex w-full max-w-xl flex-col gap-6">
					<div>
						<h2 className="font-bold text-2xl">Handle Settings</h2>
						<p className="text-muted-foreground text-sm">Choose a new handle for your page.</p>
					</div>
					<fetcher.Form method="post" className="flex flex-col gap-6" noValidate>
						{actionData?.formError ? (
							<p className="text-destructive text-sm" role="alert">
								{actionData.formError}
							</p>
						) : null}
						<FieldSet>
							<Field>
								<FieldLabel htmlFor="handle">Handle</FieldLabel>
								<FieldContent>
									<div className="relative">
										<span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground text-sm">@</span>
										<Input
											id="handle"
											name="handle"
											type="text"
											defaultValue={currentHandle}
											autoComplete="off"
											spellCheck={false}
											pattern={HANDLE_PATTERN}
											aria-invalid={!!actionData?.fieldErrors?.handle}
											aria-describedby={actionData?.fieldErrors?.handle ? "handle-error" : undefined}
											className="pl-7"
										/>
									</div>
									<FieldError id="handle-error" errors={handleErrors} />
								</FieldContent>
							</Field>
						</FieldSet>
						<Button type="submit" variant="brand" size="lg" disabled={isSubmitting} aria-busy={isSubmitting}>
							{isSubmitting ? "Updating..." : "Update handle"}
						</Button>
					</fetcher.Form>
				</div>
			</main>
		</section>
	);
}
