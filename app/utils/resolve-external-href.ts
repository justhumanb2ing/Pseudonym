export function resolveExternalHref(value: string | null | undefined) {
	const trimmed = value?.trim();
	if (!trimmed) {
		return null;
	}

	if (trimmed.startsWith("https://")) {
		return trimmed;
	}

	if (trimmed.startsWith("http://")) {
		return `https://${trimmed.slice("http://".length)}`;
	}

	if (trimmed.startsWith("/")) {
		return trimmed;
	}

	if (trimmed.startsWith("#")) {
		return trimmed;
	}

	if (trimmed.startsWith("//")) {
		return `https:${trimmed}`;
	}

	if (/^(mailto|tel):/i.test(trimmed)) {
		return trimmed;
	}

	return `https://${trimmed}`;
}
