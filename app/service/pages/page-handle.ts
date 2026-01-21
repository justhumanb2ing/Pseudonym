import { z } from "zod";

export const HANDLE_PATTERN = "^[a-z0-9]+$";
export const HANDLE_ERROR_MESSAGE = "Only lowercase letters and numbers are allowed.";

export const handleSchema = z
	.string()
	.trim()
	.toLowerCase()
	.regex(new RegExp(HANDLE_PATTERN), HANDLE_ERROR_MESSAGE);

/**
 * Normalizes a user-facing handle to the persisted format.
 */
export function formatPageHandle(handle: string): string {
	return `@${handle.trim().toLowerCase()}`;
}
