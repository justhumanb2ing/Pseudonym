import type { BrickRow, BrickRowMap, BrickType } from "types/brick";
import type { Json } from "../../../types/database.types";

export type PageGridBrickType = BrickType;
export type PageGridBrickStatus = "ready" | "draft" | "editing" | "loading";

export type PageGridBrick<T extends PageGridBrickType = PageGridBrickType> =
  BrickRow<T> & {
    status: PageGridBrickStatus;
  };

export type PageLayoutSnapshot = BrickRow<PageGridBrickType>[];

type BrickFactoryPayload = {
  url?: string;
  text?: string;
};

type BrickDataFactoryMap = {
  [K in PageGridBrickType]: (payload: BrickFactoryPayload) => BrickRowMap[K];
};

const BRICK_DATA_FACTORIES: BrickDataFactoryMap = {
  text: (payload) => ({ text: payload.text ?? "" }),
  link: (payload) => ({
    url: payload.url ?? "",
    title: null,
    description: null,
    site_name: null,
    icon_url: null,
    image_url: null,
  }),
};

/**
 * Generates a stable ID for new items.
 */
export function createPageGridBrickId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `brick-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function resolveTextBrickStatus(text: string, isEditing: boolean) {
  if (text.trim().length === 0) {
    return "draft";
  }

  return isEditing ? "editing" : "ready";
}

/**
 * Creates a new item with default data.
 */
export function createPageGridBrick(params: {
  id: string;
  type: PageGridBrickType;
  status: PageGridBrickStatus;
  payload?: BrickFactoryPayload;
}): PageGridBrick {
  return {
    id: params.id,
    type: params.type,
    status: params.status,
    data: BRICK_DATA_FACTORIES[params.type](params.payload ?? {}),
  };
}

/**
 * Applies partial link data updates without overriding unaffected fields.
 */
export function updateLinkBrickData(
  brick: PageGridBrick<"link">,
  payload: Partial<BrickRowMap["link"]>
): PageGridBrick<"link"> {
  const nextData: BrickRowMap["link"] = {
    ...brick.data,
    ...payload,
  };

  const hasChanges =
    brick.data.title !== nextData.title ||
    brick.data.description !== nextData.description ||
    brick.data.url !== nextData.url ||
    brick.data.site_name !== nextData.site_name ||
    brick.data.icon_url !== nextData.icon_url ||
    brick.data.image_url !== nextData.image_url;

  if (!hasChanges) {
    return brick;
  }

  return {
    ...brick,
    data: nextData,
  };
}

/**
 * Serializes items for persistence in page_layouts.
 */
export function serializePageLayout(
  bricks: PageGridBrick[]
): PageLayoutSnapshot | null {
  const persistedBricks = bricks
    .filter(shouldPersistBrick)
    .map(({ status: _status, ...brick }) => brick);

  if (persistedBricks.length === 0) {
    return null;
  }

  return persistedBricks;
}

/**
 * Parses a persisted page layout into items with ready status.
 */
export function parsePageLayoutSnapshot(layout: Json | null): PageGridBrick[] {
  const candidates = normalizeLayoutValue(layout);
  if (!candidates) {
    return [];
  }

  const bricks: PageGridBrick[] = [];
  for (const candidate of candidates) {
    const brick = normalizeBrickCandidate(candidate);
    if (brick) {
      bricks.push(brick);
    }
  }

  return bricks;
}

function normalizeLayoutValue(layout: Json | null): unknown[] | null {
  if (layout === null) {
    return null;
  }

  if (typeof layout === "string") {
    try {
      const parsed = JSON.parse(layout) as Json;
      return normalizeLayoutValue(parsed);
    } catch {
      return null;
    }
  }

  if (Array.isArray(layout)) {
    return layout;
  }

  if (isRecord(layout)) {
    const itemsValue = layout.items;
    if (Array.isArray(itemsValue)) {
      return itemsValue;
    }

    const bricksValue = layout.bricks;
    if (Array.isArray(bricksValue)) {
      return bricksValue;
    }
  }

  return null;
}

function normalizeBrickCandidate(value: unknown): PageGridBrick | null {
  if (!isRecord(value)) {
    return null;
  }

  const type = deriveBrickType(value);
  if (!type) {
    return null;
  }

  const id =
    typeof value.id === "string" && value.id.length > 0
      ? value.id
      : createPageGridBrickId();
  const data = mergeBrickData(value.data, type);

  return {
    id,
    type,
    status: "ready",
    data,
  };
}

function deriveBrickType(value: Record<string, unknown>): PageGridBrickType | null {
  const type = value.type;
  if (type === "text" || type === "link") {
    return type;
  }

  return null;
}

function mergeBrickData(
  raw: unknown,
  type: PageGridBrickType
): BrickRowMap[PageGridBrickType] {
  const defaults = BRICK_DATA_FACTORIES[type]({});
  if (!isRecord(raw)) {
    return defaults;
  }

  const normalized = { ...defaults } as BrickRowMap[PageGridBrickType];

  for (const key of Object.keys(defaults) as (keyof typeof defaults)[]) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      const value = raw[key];
      if (value !== undefined) {
        normalized[key] = value as BrickRowMap[PageGridBrickType][typeof key];
      }
    }
  }

  return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function shouldPersistBrick(brick: PageGridBrick) {
  if (brick.type === "text") {
    return brick.data.text.trim().length > 0;
  }

  return brick.data.url.trim().length > 0;
}
