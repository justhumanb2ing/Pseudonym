export const UMAMI_EVENT_VERSION = "v1" as const;

type NestedValueOf<T> = T extends string ? T : T extends Record<string, infer Value> ? NestedValueOf<Value> : never;

export const UMAMI_EVENTS = {
	page: {
		homeView: `${UMAMI_EVENT_VERSION}:page:home:view`,
		signInView: `${UMAMI_EVENT_VERSION}:page:sign-in:view`,
		onboardingView: `${UMAMI_EVENT_VERSION}:page:onboarding:view`,
		userProfileView: `${UMAMI_EVENT_VERSION}:page:user:view`,
	},
	auth: {
		signup: {
			view: `${UMAMI_EVENT_VERSION}:auth:signup:view`,
			start: `${UMAMI_EVENT_VERSION}:auth:signup:start`,
			submit: `${UMAMI_EVENT_VERSION}:auth:signup:submit`,
			success: `${UMAMI_EVENT_VERSION}:auth:signup:success`,
			error: `${UMAMI_EVENT_VERSION}:auth:signup:error`,
		},
		signIn: {
			view: `${UMAMI_EVENT_VERSION}:auth:sign-in:view`,
			start: `${UMAMI_EVENT_VERSION}:auth:sign-in:start`,
		},
		signOut: {
			click: `${UMAMI_EVENT_VERSION}:auth:sign-out:click`,
		},
	},
	feature: {
		brick: {
			add: `${UMAMI_EVENT_VERSION}:feature:brick:add`,
			remove: `${UMAMI_EVENT_VERSION}:feature:brick:remove`,
			success: `${UMAMI_EVENT_VERSION}:feature:brick:success`,
			error: `${UMAMI_EVENT_VERSION}:feature:brick:error`,
		},
		link: {
			submit: `${UMAMI_EVENT_VERSION}:feature:link:submit`,
			success: `${UMAMI_EVENT_VERSION}:feature:link:success`,
			error: `${UMAMI_EVENT_VERSION}:feature:link:error`,
		},
		profileImage: {
			upload: `${UMAMI_EVENT_VERSION}:feature:profile-image:upload`,
			remove: `${UMAMI_EVENT_VERSION}:feature:profile-image:remove`,
			success: `${UMAMI_EVENT_VERSION}:feature:profile-image:success`,
			error: `${UMAMI_EVENT_VERSION}:feature:profile-image:error`,
		},
		profileVisibility: {
			toggle: `${UMAMI_EVENT_VERSION}:feature:profile-visibility:toggle`,
			success: `${UMAMI_EVENT_VERSION}:feature:profile-visibility:success`,
			error: `${UMAMI_EVENT_VERSION}:feature:profile-visibility:error`,
		},
		handle: {
			open: `${UMAMI_EVENT_VERSION}:feature:handle:open`,
			submit: `${UMAMI_EVENT_VERSION}:feature:handle:submit`,
			success: `${UMAMI_EVENT_VERSION}:feature:handle:success`,
			error: `${UMAMI_EVENT_VERSION}:feature:handle:error`,
		},
		settings: {
			open: `${UMAMI_EVENT_VERSION}:feature:settings:open`,
			tab: `${UMAMI_EVENT_VERSION}:feature:settings:tab`,
		},
		accountDelete: {
			open: `${UMAMI_EVENT_VERSION}:feature:account-delete:open`,
			confirm: `${UMAMI_EVENT_VERSION}:feature:account-delete:confirm`,
			success: `${UMAMI_EVENT_VERSION}:feature:account-delete:success`,
			error: `${UMAMI_EVENT_VERSION}:feature:account-delete:error`,
		},
		pageSave: {
			success: `${UMAMI_EVENT_VERSION}:feature:page-save:success`,
			error: `${UMAMI_EVENT_VERSION}:feature:page-save:error`,
		},
	},
} as const;

export type UmamiEventName = NestedValueOf<typeof UMAMI_EVENTS>;

export const UMAMI_PROP_KEYS = {
	ctx: {
		attemptId: "ctx:attempt_id",
		action: "ctx:action",
		brickType: "ctx:brick_type",
		errorCode: "ctx:error_code",
		env: "ctx:env",
		pageId: "ctx:page_id",
		pageKind: "ctx:page_kind",
		plan: "ctx:plan",
		role: "ctx:role",
		source: "ctx:source",
		step: "ctx:step",
		tab: "ctx:tab",
	},
	exp: {
		variant: "exp:variant",
	},
} as const;

export type UmamiPropKey = NestedValueOf<typeof UMAMI_PROP_KEYS>;
