"use client";

import React from "react";

import BmMessage from "./components/bmMessage";
import { BookmarkManager } from "./components/BookmarkManager";
import { MessageProvider } from "./contexts/MessageContext";

export const Home: React.FC = () => {
  return (
    <MessageProvider>
      <BmMessage />
      <BookmarkManager />
    </MessageProvider>
  );
};

export default Home;
