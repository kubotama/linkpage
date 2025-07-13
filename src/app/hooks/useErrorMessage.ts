import { useCallback, useState } from "react";

export const useErrorMessage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const setMessage: (message?: string | undefined, isError?: boolean) => void =
    useCallback((message = undefined, isError = false) => {
      if (message === undefined) {
        setTextMessage("");
        setIsError(isError);
        return;
      }
      setTextMessage(message);
      setIsError(isError);
    }, []);

  const handleErrorClose = useCallback(() => {
    setMessage();
  }, [setMessage]);

  return {
    textMessage,
    isError,
    handleErrorClose,
    setMessage,
  };
};
