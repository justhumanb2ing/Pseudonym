export {};

declare global {
	interface CustomJwtSessionClaims {
		metadata: {
			onboardingComplete?: boolean;
		};
	}

	interface Window {
		umami?: {
			track: (...args: unknown[]) => void;
		};
	}
}
