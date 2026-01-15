import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { isMobileWeb } from "@toss/utils";

import { getStrictContext } from "@/lib/get-strict-context";
import { usePageAutoSaveActions } from "@/hooks/page/use-page-auto-save-controller";
import { useEditableAction } from "@/hooks/use-editable-action";
import {
  handleAddLinkPlaceholder,
  handleAddTextPlaceholder,
  handleRemoveBrick,
  handleUpdateLinkBrick,
  handleUpdateTextBrick,
  type PageGridState,
} from "../../../utils/page-grid-reducer-handlers";
import type { BrickLinkRow } from "types/brick";
import {
  createPageGridBrickId,
  serializePageLayout,
  type PageGridBrick,
} from "../../../service/pages/page-grid";
import type { Json } from "types/database.types";

type PageGridActions = {
  addTextBrick: () => void;
  addLinkBrick: (url: string) => string;
  updateTextBrick: (payload: {
    id: string;
    text: string;
    isEditing: boolean;
  }) => void;
  updateLinkBrick: (payload: { id: string; data: BrickLinkRow }) => void;
  removeBrick: (id: string) => void;
  isEditable: boolean;
};

const [PageGridStateProvider, usePageGridState] =
  getStrictContext<PageGridState>("PageGridState");
const [PageGridActionsProvider, usePageGridActions] =
  getStrictContext<PageGridActions>("PageGridActions");

type PageGridAction =
  | { type: "ADD_TEXT_PLACEHOLDER"; id: string }
  | { type: "ADD_LINK_PLACEHOLDER"; id: string; url: string }
  | {
      type: "UPDATE_TEXT_BRICK";
      id: string;
      text: string;
      isEditing: boolean;
    }
  | {
      type: "UPDATE_LINK_BRICK";
      id: string;
      data: BrickLinkRow;
    }
  | { type: "REMOVE_BRICK"; id: string };

function pageGridReducer(
  state: PageGridState,
  action: PageGridAction
): PageGridState {
  switch (action.type) {
    case "ADD_TEXT_PLACEHOLDER":
      return handleAddTextPlaceholder(state, action);
    case "ADD_LINK_PLACEHOLDER":
      return handleAddLinkPlaceholder(state, action);
    case "UPDATE_TEXT_BRICK":
      return handleUpdateTextBrick(state, action);
    case "UPDATE_LINK_BRICK":
      return handleUpdateLinkBrick(state, action);
    case "REMOVE_BRICK":
      return handleRemoveBrick(state, action);
    default:
      return state;
  }
}

interface PageGridProviderProps {
  isOwner: boolean;
  initialBricks?: PageGridBrick[];
  children: ReactNode;
}

/**
 * Coordinates item updates and page layout auto-save.
 */
export function PageGridProvider({
  isOwner,
  initialBricks = [],
  children,
}: PageGridProviderProps) {
  const isEditable = isOwner && !isMobileWeb();
  const [state, dispatch] = useReducer(pageGridReducer, {
    bricks: initialBricks,
  });
  const updateDraft = usePageAutoSaveActions((actions) => actions.updateDraft);

  const addTextBrickImpl = useCallback(() => {
    const id = createPageGridBrickId();
    dispatch({ type: "ADD_TEXT_PLACEHOLDER", id });
  }, []);

  const addTextBrick = useEditableAction(isEditable, addTextBrickImpl);

  const addLinkBrickImpl = useCallback((url: string) => {
    const id = createPageGridBrickId();
    dispatch({ type: "ADD_LINK_PLACEHOLDER", id, url });
    return id;
  }, []);

  const addLinkBrick = useEditableAction(isEditable, addLinkBrickImpl);

  const updateTextBrickImpl = useCallback(
    ({
      id,
      text,
      isEditing,
    }: {
      id: string;
      text: string;
      isEditing: boolean;
    }) => {
      dispatch({
        type: "UPDATE_TEXT_BRICK",
        id,
        text,
        isEditing,
      });
    },
    []
  );

  const updateTextBrick = useEditableAction(isEditable, updateTextBrickImpl);

  const updateLinkBrickImpl = useCallback(
    (payload: { id: string; data: BrickLinkRow }) => {
      dispatch({
        type: "UPDATE_LINK_BRICK",
        id: payload.id,
        data: payload.data,
      });
    },
    []
  );

  const updateLinkBrick = useEditableAction(isEditable, updateLinkBrickImpl);

  const removeBrickImpl = useCallback((id: string) => {
    dispatch({ type: "REMOVE_BRICK", id });
  }, []);

  const removeBrick = useEditableAction(isEditable, removeBrickImpl);

  const layoutSnapshot = useMemo(
    () => serializePageLayout(state.bricks),
    [state.bricks]
  );

  useEffect(() => {
    if (!isEditable) {
      return;
    }

    updateDraft({ layout: layoutSnapshot as Json });
  }, [isEditable, layoutSnapshot, updateDraft]);

  const stateValue = useMemo(
    () => ({
      bricks: state.bricks,
    }),
    [state.bricks]
  );
  const actionsValue = useMemo(
    () => ({
      addTextBrick,
      addLinkBrick,
      updateTextBrick,
      removeBrick,
      updateLinkBrick,
      isEditable,
    }),
    [
      addTextBrick,
      addLinkBrick,
      updateTextBrick,
      removeBrick,
      updateLinkBrick,
      isEditable,
    ]
  );

  return (
    <PageGridActionsProvider value={actionsValue}>
      <PageGridStateProvider value={stateValue}>
        {children}
      </PageGridStateProvider>
    </PageGridActionsProvider>
  );
}

export { usePageGridActions, usePageGridState };
