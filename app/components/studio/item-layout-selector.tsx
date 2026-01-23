/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
import { useId } from "react";
import type { ProfileItemLayout } from "types/studio.types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ItemLayoutSelectorProps = {
	value: ProfileItemLayout;
	onChange: (value: ProfileItemLayout) => void;
	disabled?: boolean;
};

export default function ItemLayoutSelector({ value, onChange, disabled }: ItemLayoutSelectorProps) {
	const id = useId();

	return (
		<div className="inline-flex flex-col gap-2">
			<p className="font-medium text-sm">Layout</p>
			<div className="inline-flex h-9 rounded-md bg-input/50 p-0.5">
				<RadioGroup
					className="group relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 font-medium text-sm after:absolute after:inset-y-0 after:w-1/2 after:rounded-sm after:bg-background after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:border-ring has-focus-visible:after:ring-[3px] has-focus-visible:after:ring-ring/50 data-[state=compact]:after:translate-x-0 data-[state=full]:after:translate-x-full"
					data-state={value}
					onValueChange={(nextValue) => onChange(nextValue as ProfileItemLayout)}
					value={value}
					disabled={disabled}
				>
					<label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors group-data-[state=full]:text-muted-foreground/70">
						Compact
						<RadioGroupItem className="sr-only" id={`${id}-1`} value="compact" />
					</label>
					<label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors group-data-[state=compact]:text-muted-foreground/70">
						Full
						<RadioGroupItem className="sr-only" id={`${id}-2`} value="full" />
					</label>
				</RadioGroup>
			</div>
		</div>
	);
}
