import { useEffect, useState } from "react";
import { Link } from "react-router";
import { authClient } from "@/lib/auth.client";
import { getSupabaseClient } from "@/lib/supabase.client";
import { Button } from "../ui/button";

interface UserButtonProps {
	label: string;
}

export default function UserButton({ label }: UserButtonProps) {
	const [primaryPageHandle, setPrimaryPageHandle] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadPrimaryHandle = async () => {
			const { data: session } = await authClient.getSession();
			const userId = session?.user?.id;
			if (!userId) {
				return;
			}

			const supabase = await getSupabaseClient();
			const { data, error } = await supabase.from("pages").select("handle").eq("owner_id", userId).eq("is_primary", true).maybeSingle();

			if (!isMounted || error) {
				return;
			}

			if (data?.handle) {
				setPrimaryPageHandle(data.handle);
			}
		};

		void loadPrimaryHandle();

		return () => {
			isMounted = false;
		};
	}, []);

	const destination = primaryPageHandle ? `/studio/${primaryPageHandle}/links` : "/sign-in";

	return (
		<Button size={"lg"} variant={"brand"} className={"px-12 text-base/relaxed"}>
			<Link prefetch="viewport" to={destination}>
				{label}
			</Link>
		</Button>
	);
}
