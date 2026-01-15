import { useCallback, useEffect, useRef, type RefObject } from "react";

type PushUpdate = (text: string, isEditing: boolean, persist?: boolean) => void;

type Result = {
  latestTextRef: RefObject<string>;
  handleValueChange: (value: string) => void;
  handleValueBlur: () => void;
};

export function usePageGridTextBrickEditHandlers(
  text: string,
  pushUpdate: PushUpdate
): Result {
  const latestTextRef = useRef(text);

  useEffect(() => {
    latestTextRef.current = text;
  }, [text]);

  const handleValueChange = useCallback(
    (value: string) => {
      latestTextRef.current = value;
      pushUpdate(value, true);
    },
    [pushUpdate]
  );

  const handleValueBlur = useCallback(() => {
    pushUpdate(latestTextRef.current, false);
  }, [pushUpdate]);

  return { latestTextRef, handleValueChange, handleValueBlur };
}
