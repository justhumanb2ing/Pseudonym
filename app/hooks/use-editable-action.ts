import { useCallback } from "react";

/**
 * Wraps an action callback to only execute when isEditable is true.
 * Returns a stable callback that checks editability before invoking the action.
 *
 * @param isEditable - Whether the action should be allowed to execute
 * @param action - The action callback to wrap
 * @returns A wrapped callback that only executes when isEditable is true
 *
 * @example
 * ```tsx
 * const addTextBrickImpl = useCallback(() => {
 *   const id = createPageGridBrickId();
 *   dispatch({ type: "ADD_TEXT_PLACEHOLDER", id });
 * }, []);
 *
 * const addTextBrick = useEditableAction(isEditable, addTextBrickImpl);
 * ```
 */
export function useEditableAction<T extends (...args: any[]) => any>(
  isEditable: boolean,
  action: T
): T {
  return useCallback(
    ((...args: Parameters<T>) => {
      if (!isEditable) {
        return;
      }
      return action(...args);
    }) as T,
    [isEditable, action]
  );
}
