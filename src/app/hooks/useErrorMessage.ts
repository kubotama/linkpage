import { useEffect, useState } from "react";

export const useErrorMessage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (errorMessage) {
      setTextMessage(errorMessage);
    } else if (loadingMessage) {
      setTextMessage(loadingMessage);
    } else {
      setTextMessage("");
    }
  }, [loadingMessage, errorMessage]);

  const handleErrorClose = () => {
    setErrorMessage("");
  };

  const isError = () => {
    return errorMessage !== "";
  };

  return {
    textMessage,
    setErrorMessage,
    setLoadingMessage,
    isError,
    handleErrorClose,
  };
};
