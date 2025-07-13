import { useCallback, useState } from "react";

export const useErrorMessage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // const setErrorMessage = useCallback((message: string) => {
  //   setTextMessage(message);
  //   setIsError(true);
  // }, []);

  // const setLoadingMessage = useCallback((message: string) => {
  //   setTextMessage(message);
  //   setIsError(false);
  // }, []);

  // const clearMessage = useCallback(() => {
  //   setTextMessage("");
  //   setIsError(false);
  // }, []);

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
    // setErrorMessage,
    // setLoadingMessage,
    isError,
    handleErrorClose,
    // clearMessage,
    setMessage,
  };
};
