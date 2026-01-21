export default function Watermark({ isWatermarkEnabled = true }: { isWatermarkEnabled?: boolean }) {
	if (!isWatermarkEnabled) return null;

	return (
		<p className="text-sm/relaxed">
			Made with{" "}
			<a href="/" className="font-medium hover:underline">
				Venus
			</a>
		</p>
	);
}
