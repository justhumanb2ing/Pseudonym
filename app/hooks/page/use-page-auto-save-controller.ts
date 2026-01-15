import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { debounce, isEqual } from "es-toolkit";

import { usePageSaver } from "@/hooks/use-page-saver";
import type { PageSnapshot } from "../../service/pages/save-page";
import { trackUmamiEvent } from "@/lib/umami";
import { UMAMI_EVENTS, UMAMI_PROP_KEYS } from "@/lib/umami-events";
import {
  pageAutoSaveStore,
  usePageAutoSaveStore,
  type AutoSaveState,
  type AutoSaveStatus,
  type PageAutoSaveControllerActions,
} from "./use-page-auto-save-store";

const statusLabels: Record<AutoSaveStatus, string> = {
  idle: "Up to date",
  dirty: "Saving",
  saving: "Saving",
  synced: "Up to date",
  error: "Save failed",
};

type PageAutoSaveActions = PageAutoSaveControllerActions;

interface PageAutoSaveControllerProps {
  pageId: string;
  initialSnapshot: PageSnapshot;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Coordinates debounced page snapshot saves and exposes status via context.
 */
export function usePageAutoSaveController({
  pageId,
  initialSnapshot,
  debounceMs = 800,
  enabled = true,
}: PageAutoSaveControllerProps) {
  const savePage = usePageSaver();
  const savePageRef = useRef(savePage);
  const snapshotRef = useRef<PageSnapshot>(initialSnapshot);
  const syncedSnapshotRef = useRef<PageSnapshot>(initialSnapshot);
  const requestIdRef = useRef(0);
  const pageIdRef = useRef(pageId);
  const enabledRef = useRef(enabled);
  const mountedRef = useRef(true);

  useEffect(() => {
    savePageRef.current = savePage;
  }, [savePage]);

  useEffect(() => {
    pageIdRef.current = pageId;
  }, [pageId]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const performSave = useCallback(async (requestId: number) => {
    if (!enabledRef.current) {
      return;
    }

    pageAutoSaveStore.getState().setStatus("saving");
    const snapshot = snapshotRef.current;

    try {
      await savePageRef.current({ pageId: pageIdRef.current, ...snapshot });

      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      syncedSnapshotRef.current = snapshot;
      pageAutoSaveStore.getState().setStatus("synced");
      trackUmamiEvent(
        UMAMI_EVENTS.feature.pageSave.success,
        {
          [UMAMI_PROP_KEYS.ctx.pageId]: pageIdRef.current,
          [UMAMI_PROP_KEYS.ctx.action]: "auto",
        },
        {
          dedupeKey: `page-save-success:${pageIdRef.current}`,
          ttlMs: 30000,
        }
      );
    } catch (error) {
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      const message =
        error instanceof Error ? error.message : statusLabels.error;
      pageAutoSaveStore.getState().setError(message);
      trackUmamiEvent(
        UMAMI_EVENTS.feature.pageSave.error,
        {
          [UMAMI_PROP_KEYS.ctx.pageId]: pageIdRef.current,
          [UMAMI_PROP_KEYS.ctx.action]: "auto",
          [UMAMI_PROP_KEYS.ctx.errorCode]: "save_failed",
        },
        {
          dedupeKey: `page-save-error:${pageIdRef.current}`,
          ttlMs: 30000,
        }
      );
    }
  }, []);

  const debouncedSave = useMemo(
    () =>
      debounce((requestId: number) => {
        void performSave(requestId);
      }, debounceMs),
    [performSave, debounceMs]
  );

  useEffect(() => {
    snapshotRef.current = initialSnapshot;
    syncedSnapshotRef.current = initialSnapshot;
    requestIdRef.current += 1;
    debouncedSave.cancel();
    pageAutoSaveStore.getState().setStatus("idle");
  }, [initialSnapshot, debouncedSave]);

  useEffect(() => {
    if (!enabled) {
      debouncedSave.cancel();
      pageAutoSaveStore.getState().setStatus("idle");
    }
  }, [enabled, debouncedSave]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const updateDraft = useCallback(
    (changes: Partial<PageSnapshot>) => {
      if (!enabledRef.current) {
        return;
      }

      const previousSnapshot = snapshotRef.current;
      const nextSnapshot = { ...previousSnapshot, ...changes };

      if (isEqual(nextSnapshot, previousSnapshot)) {
        return;
      }

      snapshotRef.current = nextSnapshot;
      requestIdRef.current += 1;

      if (isEqual(nextSnapshot, syncedSnapshotRef.current)) {
        debouncedSave.cancel();
        pageAutoSaveStore.getState().setStatus("idle");
        return;
      }

      pageAutoSaveStore.getState().setStatus("dirty");
      debouncedSave(requestIdRef.current);
    },
    [debouncedSave]
  );

  const markDirty = useCallback(() => {
    if (!enabledRef.current) {
      return;
    }

    requestIdRef.current += 1;
    debouncedSave.cancel();
    pageAutoSaveStore.getState().setStatus("dirty");
  }, [debouncedSave]);

  const markError = useCallback(() => {
    pageAutoSaveStore.getState().setError(statusLabels.error);
  }, []);

  const actionsValue = useMemo(
    () => ({ updateDraft, markDirty, markError }),
    [updateDraft, markDirty, markError]
  );

  useEffect(() => {
    pageAutoSaveStore.getState().setControllerActions(actionsValue);
    return () => {
      pageAutoSaveStore.getState().resetControllerActions();
    };
  }, [actionsValue]);
}

type PageAutoSaveState = {
  status: AutoSaveStatus;
  statusLabel: string;
  message: string | null;
};

function selectPageAutoSaveState(state: AutoSaveState): PageAutoSaveState {
  return {
    status: state.status,
    statusLabel: statusLabels[state.status],
    message: state.message,
  };
}

function usePageAutoSaveState(): PageAutoSaveState;
function usePageAutoSaveState<T>(
  selector: (state: PageAutoSaveState) => T
): T;
function usePageAutoSaveState<T>(
  selector?: (state: PageAutoSaveState) => T
) {
  const viewRef = useRef<PageAutoSaveState | null>(null);

  return usePageAutoSaveStore((state) => {
    const view = selectPageAutoSaveState(state);
    const previous = viewRef.current;

    if (
      previous &&
      previous.status === view.status &&
      previous.message === view.message
    ) {
      return selector ? selector(previous) : previous;
    }

    viewRef.current = view;
    return selector ? selector(view) : view;
  });
}

function usePageAutoSaveActions(): PageAutoSaveActions;
function usePageAutoSaveActions<T>(
  selector: (actions: PageAutoSaveActions) => T
): T;
function usePageAutoSaveActions<T>(
  selector?: (actions: PageAutoSaveActions) => T
) {
  return usePageAutoSaveStore((state) => {
    const actions = state.controllerActions;
    return selector ? selector(actions) : actions;
  });
}

export { usePageAutoSaveActions, usePageAutoSaveState };
export type { AutoSaveStatus };
