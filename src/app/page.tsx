"use client";

import React from "react";

import { BmGrid } from "./components/bmGrid";
import BmMessage from "./components/bmMessage";
import { BookmarkProvider } from "./contexts/BookmarkContext";
import { MessageProvider } from "./contexts/MessageContext";

export const Home: React.FC = () => {
  return (
    <MessageProvider>
      <BookmarkProvider>
        <BmMessage />
        <BmGrid />
      </BookmarkProvider>
    </MessageProvider>
  );
};

export default Home;
