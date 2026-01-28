import { clerkClient, getAuth } from "@clerk/react-router/server";
import { useParams } from "react-router";
import DeleteAccountButton from "@/components/auth/delete-account-button";
import type { Route } from "./+types/studio.$handle.account";

type ErrorResponse = {
	error: string;
};

type SuccessResponse = {
	message: string;
};

function jsonResponse(payload: ErrorResponse | SuccessResponse, status: number) {
	return new Response(JSON.stringify(payload), {
		status,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export async function action(args: Route.ActionArgs) {
	if (args.request.method !== "POST") {
		return jsonResponse({ error: "Method not allowed." }, 405);
	}

	const auth = await getAuth(args);
	if (!auth.userId) {
		return jsonResponse({ error: "Unauthorized." }, 401);
	}

	const clerk = clerkClient(args);

	try {
		await clerk.users.deleteUser(auth.userId);
		return jsonResponse({ message: "Account deleted." }, 200);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to delete account.";
		return jsonResponse({ error: message }, 500);
	}
}

export default function StudioSettingsAccountRoute() {
	const { handle } = useParams();
	const deleteEndpoint = handle ? `/studio/${handle}/account` : "/api/delete-account";

	return (
		<section className="flex grow flex-col gap-6 p-2 px-4 pb-6">
			<main className="h-full rounded-2xl p-6">
				<div className="flex w-full max-w-xl flex-col gap-6">
					<div>
						<h2 className="font-bold text-2xl">Account Settings</h2>
						<p className="text-muted-foreground text-sm">Manage account access and remove your account permanently.</p>
					</div>
					<div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
						<h3 className="font-semibold text-base text-destructive">Delete account</h3>
						<p className="mt-2 text-muted-foreground text-sm">
							This action cannot be undone. Your data and all handles linked to your account will be permanently deleted.
						</p>
						<div className="mt-3">
							<DeleteAccountButton endpoint={deleteEndpoint} />
						</div>
					</div>
				</div>
			</main>
		</section>
	);
}
