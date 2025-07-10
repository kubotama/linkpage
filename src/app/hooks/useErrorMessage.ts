import { useCallback, useState } from "react";

export const useErrorMessage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const setErrorMessage = useCallback((message: string) => {
    setTextMessage(message);
    setIsError(true);
  }, []);

  const setLoadingMessage = useCallback((message: string) => {
    setTextMessage(message);
    setIsError(false);
  }, []);

  const clearMessage = useCallback(() => {
    setTextMessage("");
    setIsError(false);
  }, []);

  const handleErrorClose = () => {
    clearMessage();
  };

  return {
    textMessage,
    setErrorMessage,
    setLoadingMessage,
    isError,
    handleErrorClose,
    clearMessage,
  };
};
