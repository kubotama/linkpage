import { useCallback, useEffect } from "react";

type KeyHandlerMap = {
  [key: string]: (event: KeyboardEvent) => void | boolean;
};

export const useKeyHandler = (keyHandlerMap: KeyHandlerMap) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const handler = keyHandlerMap[event.key];
      if (handler) {
        const result = handler(event);
        if (result === false) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    },
    [keyHandlerMap]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};
