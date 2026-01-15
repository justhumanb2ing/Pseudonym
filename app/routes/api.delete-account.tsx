import { clerkClient, getAuth } from "@clerk/react-router/server";

import type { Route } from "./+types/api.delete-account";

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
    const message =
      error instanceof Error ? error.message : "Failed to delete account.";
    return jsonResponse({ error: message }, 500);
  }
}

export default function DeleteAccountRoute() {
  return null;
}
