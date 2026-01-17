import { useState } from "react";

import { getSupabaseClient } from "@/lib/supabase";

export type HandleValidationResult = {
	available: boolean;
	error?: string;
};

/**
 * 핸들 중복 확인을 위한 훅
 */
export function useHandleValidation() {
	const [isChecking, setIsChecking] = useState(false);
	const supabase = getSupabaseClient();

	const checkHandleAvailability = async (handle: string): Promise<HandleValidationResult> => {
		if (!supabase) {
			return {
				available: false,
				error: "Handle validation is unavailable.",
			};
		}

		setIsChecking(true);

		try {
			const result = await (await supabase).from("pages").select("id").eq("handle", `@${handle}`).maybeSingle();

			if (result.error) {
				return {
					available: false,
					error: result.error.message,
				};
			}

			if (result.data) {
				return {
					available: false,
					error: "Handle already exists.",
				};
			}

			return { available: true };
		} finally {
			setIsChecking(false);
		}
	};

	return {
		checkHandleAvailability,
		isChecking,
	};
}
