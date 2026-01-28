// app/routes/api.auth.$.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { auth } from "@/lib/auth";

// GET, HEAD 등
export async function loader({ request }: LoaderFunctionArgs) {
	return auth.handler(request);
}

// POST 등
export async function action({ request }: ActionFunctionArgs) {
	return auth.handler(request);
}
