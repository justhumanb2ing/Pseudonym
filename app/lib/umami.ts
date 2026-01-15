import {
  UMAMI_PROP_KEYS,
  type UmamiEventName,
  type UmamiPropKey,
} from "@/lib/umami-events";

type UmamiEventValue = string | number | boolean;

export type UmamiEventProps = Partial<Record<UmamiPropKey | string, UmamiEventValue>>;

type UmamiTrackOptions = {
  dedupeKey?: string;
  ttlMs?: number;
  once?: boolean;
};

type UmamiClientConfig = {
  websiteId: string | null;
  scriptUrl: string;
  environment: string;
};

type UmamiTrackFunction = {
  (event: UmamiEventName, data?: UmamiEventProps): void;
  (mapper: (props: Record<string, unknown>) => Record<string, unknown>): void;
};

type UmamiGlobal = {
  track: UmamiTrackFunction;
};

const DEFAULT_DEDUPE_TTL_MS = 2000;
const dedupeCache = new Map<string, number>();
const onceCache = new Set<string>();
const REDACTION_TOKEN = "[redacted]";
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_REGEX = /\+?\d[\d\s().-]{7,}\d/;

export function createUmamiAttemptId(prefix?: string) {
  const base =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return prefix ? `${prefix}-${base}` : base;
}

function getUmami(): UmamiGlobal | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.umami ?? null;
}

/**
 * Resolve Umami client configuration from Vite env variables.
 */
export function resolveUmamiClientConfig(): UmamiClientConfig {
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID ?? null;
  const scriptUrl =
    import.meta.env.VITE_UMAMI_SCRIPT_URL ?? "https://cloud.umami.is/script.js";
  const environment =
    import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE ?? "unknown";

  return { websiteId, scriptUrl, environment };
}

function buildBaseProps(props?: UmamiEventProps) {
  const { environment } = resolveUmamiClientConfig();
  const base: UmamiEventProps = {
    [UMAMI_PROP_KEYS.ctx.env]: environment,
  };

  return props ? { ...base, ...props } : base;
}

function toAttributeKey(key: string) {
  return key.replace(/:/g, "-");
}

function toAttributeValue(value: UmamiEventValue) {
  return String(value);
}

function isPiiLike(value: string) {
  if (EMAIL_REGEX.test(value)) {
    return true;
  }

  if (PHONE_REGEX.test(value)) {
    return true;
  }

  return false;
}

function sanitizeText(value: string) {
  if (!value) {
    return value;
  }

  if (isPiiLike(value)) {
    return REDACTION_TOKEN;
  }

  return value;
}

function sanitizePathSegment(segment: string) {
  if (!segment) {
    return segment;
  }

  const decoded = safeDecodeURIComponent(segment);
  if (isPiiLike(decoded) || decoded.includes("@")) {
    return REDACTION_TOKEN;
  }

  return segment;
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Remove query/hash and redact any PII-like path segment.
 */
export function sanitizeUrl(value: string) {
  const trimmed = value.trim();
  const pathOnly = trimmed.split(/[?#]/)[0] ?? "";
  const normalized = pathOnly.replace(/\/+$/, "") || "/";
  const parts = normalized.split("/");
  const sanitized = parts.map(sanitizePathSegment).join("/");

  return sanitized.startsWith("/") ? sanitized : `/${sanitized}`;
}

export function sanitizeEventProps(props?: UmamiEventProps) {
  if (!props) {
    return undefined;
  }

  const sanitized: UmamiEventProps = {};

  for (const [key, rawValue] of Object.entries(props)) {
    if (rawValue === null || rawValue === undefined) {
      continue;
    }

    if (typeof rawValue === "string") {
      const value = sanitizeText(rawValue);
      if (value === REDACTION_TOKEN) {
        continue;
      }
      sanitized[key] = value;
      continue;
    }

    sanitized[key] = rawValue;
  }

  return sanitized;
}

function shouldSkipEvent(options?: UmamiTrackOptions) {
  const key = options?.dedupeKey;
  if (!key) {
    return false;
  }

  if (options?.once) {
    if (onceCache.has(key)) {
      return true;
    }
    onceCache.add(key);
    return false;
  }

  const now = Date.now();
  const ttlMs = options?.ttlMs ?? DEFAULT_DEDUPE_TTL_MS;
  const last = dedupeCache.get(key);

  if (last && now - last < ttlMs) {
    return true;
  }

  dedupeCache.set(key, now);
  return false;
}

/**
 * Builds data-umami-event attributes with PII-safe props.
 */
export function getUmamiEventAttributes(
  event: UmamiEventName,
  props?: UmamiEventProps
): Record<string, string> {
  const sanitizedProps = sanitizeEventProps(buildBaseProps(props));
  const attributes: Record<string, string> = {
    "data-umami-event": event,
  };

  if (!sanitizedProps) {
    return attributes;
  }

  for (const [key, value] of Object.entries(sanitizedProps)) {
    if (value === null || value === undefined) {
      continue;
    }

    attributes[`data-umami-event-${toAttributeKey(key)}`] =
      toAttributeValue(value);
  }

  return attributes;
}

/**
 * Track a custom Umami event with optional de-duplication.
 */
export function trackUmamiEvent(
  event: UmamiEventName,
  props?: UmamiEventProps,
  options?: UmamiTrackOptions
) {
  if (shouldSkipEvent(options)) {
    return false;
  }

  const umami = getUmami();
  if (!umami) {
    return false;
  }

  const sanitizedProps = sanitizeEventProps(buildBaseProps(props));
  umami.track(event, sanitizedProps);
  return true;
}

/**
 * Track a page view with custom url/title normalization.
 */
export function trackUmamiPageView(params: {
  url: string;
  title?: string;
  props?: UmamiEventProps;
  options?: UmamiTrackOptions;
}) {
  if (shouldSkipEvent(params.options)) {
    return false;
  }

  const umami = getUmami();
  if (!umami) {
    return false;
  }

  const { websiteId } = resolveUmamiClientConfig();
  if (!websiteId) {
    return false;
  }

  const sanitizedUrl = sanitizeUrl(params.url);
  const title = params.title ? sanitizeText(params.title) : undefined;
  const sanitizedProps = sanitizeEventProps(buildBaseProps(params.props));

  umami.track((props) => ({
    ...props,
    website: websiteId,
    url: sanitizedUrl,
    title,
    ...sanitizedProps,
  }));

  return true;
}
