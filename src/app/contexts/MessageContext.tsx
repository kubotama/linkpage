import React, { createContext, useContext, useState } from "react";

interface Message {
  text: string;
}

interface MessageContextProps {
  message: Message | null;
  setMessage: (message: Message) => void;
}

const MessageContext = createContext<MessageContextProps | undefined>(
  undefined
);

interface MessageProviderProps {
  children: React.ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
}) => {
  const [message, setMessage] = useState<Message | null>({ text: "" });

  return (
    <MessageContext.Provider value={{ message, setMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};
