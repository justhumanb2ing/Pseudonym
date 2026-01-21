import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

type SearchResult = {
	id: string;
	place_name: string;
	center: [number, number];
};

type MapSearchProps = {
	onSelect: (result: SearchResult) => void;
	disabled?: boolean;
	className?: string;
};

const SEARCH_DEBOUNCE_MS = 500;

export function MapSearch({ onSelect, disabled = false, className }: MapSearchProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [_loading, setLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const isSelectingRef = useRef(false);
	const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
	const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

	useEffect(() => {
		if (isSelectingRef.current) {
			isSelectingRef.current = false;
			setLoading(false);
			return;
		}

		if (!debouncedQuery.trim()) {
			setResults([]);
			setLoading(false);
			return;
		}

		if (!accessToken || debouncedQuery.trim().length < 2) {
			setResults([]);
			setLoading(false);
			return;
		}

		const controller = new AbortController();
		setLoading(true);

		const fetchResults = async () => {
			try {
				const response = await fetch(
					`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
						debouncedQuery,
					)}&access_token=${accessToken}&language=ko,en&limit=5&autocomplete=true&types=country,place&format=v5`,
					{ signal: controller.signal },
				);

				const json = await response.json();
				setResults(json.features ?? []);
			} catch (error) {
				if ((error as { name?: string }).name !== "AbortError") {
					setResults([]);
				}
			} finally {
				setLoading(false);
			}
		};

		void fetchResults();

		return () => {
			controller.abort();
		};
	}, [debouncedQuery]);

	const handleSelect = (result: SearchResult) => {
		isSelectingRef.current = true;
		setQuery(result.place_name);
		setResults([]);
		onSelect(result);
	};

	const handleClear = () => {
		setQuery("");
		setResults([]);
		inputRef.current?.focus();
	};

	return (
		<div className={cn("relative", className)}>
			<div className="relative">
				<Input
					ref={inputRef}
					value={query}
					onChange={(event) => {
						isSelectingRef.current = false;
						setQuery(event.target.value);
					}}
					placeholder={disabled ? "Map search unavailable" : "Search location"}
					autoComplete="off"
					disabled={disabled}
					className="h-10 rounded-xl pr-9 pl-9"
				/>
				<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
					<Search className="size-4" />
				</span>
				{query && !disabled ? (
					<button
						type="button"
						onClick={handleClear}
						aria-label="Clear search"
						className="absolute inset-y-0 right-2 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
					>
						<X className="size-4" />
					</button>
				) : null}
			</div>
			{results.length > 0 ? (
				<ul className="mt-1.5 flex max-h-48 w-full flex-col gap-0.5 overflow-y-auto rounded-lg border bg-background p-1 text-xs shadow-lg">
					{results.map((result) => (
						<li key={result.id} className="">
							<Button
								variant="ghost"
								size="sm"
								type="button"
								onClick={() => handleSelect(result)}
								className="h-auto w-full justify-start rounded-sm px-3 py-2 text-left text-xs"
							>
								{result.place_name}
							</Button>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}
