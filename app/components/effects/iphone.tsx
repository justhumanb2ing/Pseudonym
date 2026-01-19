export default function Iphone() {
	return (
		<div className="flex items-center justify-center">
			{/* iPhone 15 Container  */}
			<div className="relative h-[600px] w-72 rounded-[45px] border-8 border-zinc-900 shadow-[0_0_2px_2px_rgba(255,255,255,0.1)]">
				{/* Dynamic Island */}
				<div className="absolute top-2 left-1/2 z-20 h-[22px] w-[90px] -translate-x-1/2 transform rounded-full bg-zinc-900"></div>

				<div className="pointer-events-none absolute -inset-px rounded-[37px] border-[3px] border-zinc-700 border-opacity-40"></div>

				{/* Screen Content */}
				<div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[37px] bg-background"></div>

				{/* Left Side Buttons */}
				{/* <div className="absolute top-20 left-[-12px] h-8 w-[6px] rounded-l-md bg-zinc-900 shadow-md"></div>

				<div className="absolute top-36 left-[-12px] h-12 w-[6px] rounded-l-md bg-zinc-900 shadow-md"></div>

				<div className="absolute top-52 left-[-12px] h-12 w-[6px] rounded-l-md bg-zinc-900 shadow-md"></div>

				<div className="absolute top-36 right-[-12px] h-16 w-[6px] rounded-r-md bg-zinc-900 shadow-md"></div> */}
			</div>
		</div>
	);
}
