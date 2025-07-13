import { useCallback, useState } from "react";

export const useErrorMessage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const setMessage = useCallback((message = "", isError = false) => {
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
