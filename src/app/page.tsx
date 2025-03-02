"use client";

import React from "react";

import BmMessage from "./components/bmMessage";
import { LinkPage } from "./components/LinkPage";
import { MessageProvider } from "./contexts/MessageContext";

export const Home: React.FC = () => {
  return (
    <MessageProvider>
      <BmMessage />
      <LinkPage />
    </MessageProvider>
  );
};

export default Home;
