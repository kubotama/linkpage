import { useCallback, useState } from "react";

export const useErrorMessage = () => {
  const [textMessage, setTextMessage] = useState("");
  // const [loadingMessage, setLoadingMessage] = useState("");
  // const [errorMessage, setErrorMessage] = useState("");
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

  // useEffect(() => {
  //   if (errorMessage) {
  //     setTextMessage(errorMessage);
  //   } else if (loadingMessage) {
  //     setTextMessage(loadingMessage);
  //   } else {
  //     setTextMessage("");
  //   }
  // }, [loadingMessage, errorMessage]);

  const handleErrorClose = () => {
    setErrorMessage("");
    setIsError(false);
  };

  // const isError = () => {
  //   return errorMessage !== "";
  // };

  return {
    textMessage,
    setErrorMessage,
    setLoadingMessage,
    isError,
    handleErrorClose,
    clearMessage,
  };
};
