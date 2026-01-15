import {
  createPageGridBrick,
  resolveTextBrickStatus,
  updateLinkBrickData,
  type PageGridBrick,
} from "../service/pages/page-grid";
import type { BrickLinkRow } from "types/brick";

export type PageGridState = {
  bricks: PageGridBrick[];
};

/**
 * Handles adding a text placeholder brick to the state.
 */
export function handleAddTextPlaceholder(
  state: PageGridState,
  payload: { id: string }
): PageGridState {
  const brick = createPageGridBrick({
    id: payload.id,
    type: "text",
    status: "draft",
  });

  return {
    bricks: [...state.bricks, brick],
  };
}

/**
 * Handles adding a link placeholder brick to the state.
 */
export function handleAddLinkPlaceholder(
  state: PageGridState,
  payload: { id: string; url: string }
): PageGridState {
  const brick = createPageGridBrick({
    id: payload.id,
    type: "link",
    status: "loading",
    payload: {
      url: payload.url,
    },
  });

  return {
    bricks: [...state.bricks, brick],
  };
}

/**
 * Handles updating a text brick's content and status.
 */
export function handleUpdateTextBrick(
  state: PageGridState,
  payload: {
    id: string;
    text: string;
    isEditing: boolean;
  }
): PageGridState {
  let didUpdate = false;
  const nextBricks = state.bricks.map((brick) => {
    if (brick.id !== payload.id || brick.type !== "text") {
      return brick;
    }

    const nextStatus = resolveTextBrickStatus(payload.text, payload.isEditing);
    const shouldUpdate =
      brick.data.text !== payload.text || brick.status !== nextStatus;

    if (!shouldUpdate) {
      return brick;
    }

    didUpdate = true;
    return {
      ...brick,
      status: nextStatus,
      data: {
        ...brick.data,
        text: payload.text,
      },
    };
  });

  if (!didUpdate) {
    return state;
  }

  return {
    bricks: nextBricks,
  };
}

/**
 * Handles updating a link brick's data.
 */
export function handleUpdateLinkBrick(
  state: PageGridState,
  payload: { id: string; data: BrickLinkRow }
): PageGridState {
  let didUpdate = false;
  const nextBricks = state.bricks.map((brick) => {
    if (brick.id !== payload.id || brick.type !== "link") {
      return brick;
    }

    const updatedBrick = updateLinkBrickData(brick, payload.data);
    const nextBrick =
      updatedBrick === brick && brick.status === "ready"
        ? brick
        : { ...updatedBrick, status: "ready" as const };

    if (nextBrick === brick) {
      return brick;
    }

    didUpdate = true;
    return nextBrick;
  });

  if (!didUpdate) {
    return state;
  }

  return {
    bricks: nextBricks,
  };
}

/**
 * Handles removing a brick from the state.
 */
export function handleRemoveBrick(
  state: PageGridState,
  payload: { id: string }
): PageGridState {
  return {
    bricks: state.bricks.filter((brick) => brick.id !== payload.id),
  };
}
