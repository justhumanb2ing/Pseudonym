import { useClerk, useUser } from "@clerk/react-router";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { createUmamiAttemptId, getUmamiEventAttributes, trackUmamiEvent } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";

const DELETE_ACCOUNT_ENDPOINT = "/api/delete-account";

type DeleteAccountResponse = {
	message: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const getPayloadMessage = (value: unknown, key: "message" | "error"): string | null => {
	if (!isRecord(value)) {
		return null;
	}

	const candidate = value[key];
	return typeof candidate === "string" ? candidate : null;
};

type DeleteAccountButtonProps = {
	endpoint?: string;
};

async function requestDeleteAccount(endpoint: string): Promise<DeleteAccountResponse> {
	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			Accept: "application/json",
		},
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		const message = getPayloadMessage(data, "error") ?? "Failed to delete account.";
		throw new Error(message);
	}

	return {
		message: getPayloadMessage(data, "message") ?? "Account deleted.",
	};
}

export default function DeleteAccountButton({ endpoint = DELETE_ACCOUNT_ENDPOINT }: DeleteAccountButtonProps) {
	const clerk = useClerk();
	const { isLoaded, isSignedIn } = useUser();
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const isDisabled = !isLoaded || !isSignedIn || isDeleting;

	const handleDelete = async () => {
		if (isDisabled) {
			return;
		}

		setIsDeleting(true);
		const attemptId = createUmamiAttemptId("delete-account");
		trackUmamiEvent(
			UMAMI_EVENTS.feature.accountDelete.confirm,
			{
				[UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
				[UMAMI_PROP_KEYS.ctx.source]: "settings",
			},
			{
				dedupeKey: `account-delete-confirm:${attemptId}`,
				once: true,
			},
		);
		const deletePromise = requestDeleteAccount(endpoint);

		toastManager.promise(deletePromise, {
			loading: {
				title: "Deleting account...",
			},
			success: (_data: DeleteAccountResponse) => ({
				title: "Account deleted",
			}),
			error: (error: unknown) => ({
				title: "Delete failed",
				description: error instanceof Error ? error.message : "Please try again.",
			}),
		});

		try {
			await deletePromise;
			trackUmamiEvent(
				UMAMI_EVENTS.feature.accountDelete.success,
				{
					[UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
					[UMAMI_PROP_KEYS.ctx.source]: "settings",
				},
				{
					dedupeKey: `account-delete-success:${attemptId}`,
					once: true,
				},
			);
			await clerk.signOut({ redirectUrl: "/" });
		} catch (_error) {
			trackUmamiEvent(
				UMAMI_EVENTS.feature.accountDelete.error,
				{
					[UMAMI_PROP_KEYS.ctx.attemptId]: attemptId,
					[UMAMI_PROP_KEYS.ctx.source]: "settings",
					[UMAMI_PROP_KEYS.ctx.errorCode]: "delete_failed",
				},
				{
					dedupeKey: `account-delete-error:${attemptId}`,
					once: true,
				},
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleConfirmDelete = () => {
		setOpen(false);
		void handleDelete();
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				render={
					<Button
						type="button"
						size={"lg"}
						variant="ghost"
						disabled={isDisabled}
						className={"px-0 font-normal text-destructive text-sm hover:bg-transparent hover:text-destructive"}
						{...getUmamiEventAttributes(UMAMI_EVENTS.feature.accountDelete.open, {
							[UMAMI_PROP_KEYS.ctx.source]: "settings",
						})}
					>
						{isDeleting ? "Deleting..." : "Delete account"}
					</Button>
				}
			/>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete account?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. Your data will be permanently deleted. All handles linked to your account will be deleted.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction variant="destructive" onClick={handleConfirmDelete} disabled={isDisabled} aria-busy={isDeleting}>
						{isDeleting ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
