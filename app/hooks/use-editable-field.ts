import { useCallback, useEffect, useRef, useState } from "react";

type UseEditableFieldOptions = {
  initialValue: string;
  onCommit: (value: string) => void;
  normalize: (value: string | null | undefined) => string | null;
  isEditable: boolean;
  debounceMs?: number;
};

type UseEditableFieldReturn = {
  value: string;
  handleChange: (value: string) => void;
  handleBlur: () => void;
  handleFocus: () => void;
};

/**
 * 편집 가능한 필드를 위한 상태 관리 훅
 *
 * draft state, debouncing, auto-save 로직을 캡슐화합니다.
 *
 * @param initialValue - 초기값
 * @param onCommit - 값 커밋 시 호출되는 콜백
 * @param normalize - 값 정규화 함수
 * @param isEditable - 편집 가능 여부
 * @param debounceMs - debounce 지연 시간 (기본값: 650ms)
 */
export function useEditableField({
  initialValue,
  onCommit,
  normalize,
  isEditable,
  debounceMs = 650,
}: UseEditableFieldOptions): UseEditableFieldReturn {
  const [value, setValue] = useState(initialValue);
  const valueRef = useRef(initialValue);
  const isEditingRef = useRef(false);
  const hasPendingChangeRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedValueRef = useRef(normalize(initialValue));

  // initialValue 변경 시 동기화
  useEffect(() => {
    if (isEditingRef.current || hasPendingChangeRef.current) {
      return;
    }

    valueRef.current = initialValue;
    setValue(initialValue);
    lastSavedValueRef.current = normalize(initialValue);
  }, [initialValue, normalize]);

  // cleanup
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const commitValue = useCallback(
    (nextValue: string) => {
      if (!isEditable || !hasPendingChangeRef.current) {
        return;
      }

      const normalizedValue = normalize(nextValue);
      if (normalizedValue === lastSavedValueRef.current) {
        hasPendingChangeRef.current = false;
        return;
      }

      onCommit(nextValue);
      lastSavedValueRef.current = normalizedValue;
      hasPendingChangeRef.current = false;
    },
    [isEditable, normalize, onCommit]
  );

  const scheduleSave = useCallback(
    (nextValue: string) => {
      if (!isEditable) {
        return;
      }

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        commitValue(nextValue);
      }, debounceMs);
    },
    [commitValue, debounceMs, isEditable]
  );

  const handleChange = useCallback(
    (nextValue: string) => {
      if (!isEditable) {
        return;
      }

      valueRef.current = nextValue;
      setValue(nextValue);
      hasPendingChangeRef.current = true;
      scheduleSave(nextValue);
    },
    [isEditable, scheduleSave]
  );

  const handleBlur = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    commitValue(valueRef.current);
    isEditingRef.current = false;
  }, [commitValue]);

  const handleFocus = useCallback(() => {
    isEditingRef.current = true;
  }, []);

  return {
    value,
    handleChange,
    handleBlur,
    handleFocus,
  };
}
