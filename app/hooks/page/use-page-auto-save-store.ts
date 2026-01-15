import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type { PageSnapshot } from "../../service/pages/save-page";

type AutoSaveStatus = "idle" | "dirty" | "saving" | "synced" | "error";

type AutoSaveState = {
  status: AutoSaveStatus;
  message: string | null;
};

type AutoSaveActions = {
  setState: (next: AutoSaveState) => void;
  setStatus: (status: AutoSaveStatus) => void;
  setError: (message: string) => void;
  reset: () => void;
};

type PageAutoSaveControllerActions = {
  updateDraft: (changes: Partial<PageSnapshot>) => void;
  markDirty: () => void;
  markError: () => void;
};

type PageAutoSaveStore = AutoSaveState &
  AutoSaveActions & {
    controllerActions: PageAutoSaveControllerActions;
    setControllerActions: (actions: PageAutoSaveControllerActions) => void;
    resetControllerActions: () => void;
  };

const initialState: AutoSaveState = {
  status: "idle",
  message: null,
};

const noop = () => {};
const noopUpdateDraft = (_changes: Partial<PageSnapshot>) => {};

const initialControllerActions: PageAutoSaveControllerActions = {
  updateDraft: noopUpdateDraft,
  markDirty: noop,
  markError: noop,
};

export const pageAutoSaveStore = createStore<PageAutoSaveStore>()((set) => ({
  ...initialState,
  controllerActions: initialControllerActions,
  setState: (next) => set(next),
  setStatus: (status) => set({ status, message: null }),
  setError: (message) => set({ status: "error", message }),
  reset: () => set(initialState),
  setControllerActions: (actions) => set({ controllerActions: actions }),
  resetControllerActions: () =>
    set({ controllerActions: initialControllerActions }),
}));

export type {
  AutoSaveStatus,
  AutoSaveState,
  AutoSaveActions,
  PageAutoSaveControllerActions,
  PageAutoSaveStore,
};

export function usePageAutoSaveStore(): PageAutoSaveStore;
export function usePageAutoSaveStore<T>(
  selector: (state: PageAutoSaveStore) => T
): T;
export function usePageAutoSaveStore<T>(
  selector?: (state: PageAutoSaveStore) => T
) {
  return useStore(pageAutoSaveStore, selector!);
}
