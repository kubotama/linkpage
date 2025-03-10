"use client";

import React from "react";

import BmMessage from "./components/bmMessage";
import { BookmarkManager } from "./components/BookmarkManager";
import { MessageProvider } from "./contexts/MessageContext";
import styles from "./styles.module.css";
import { Timer } from "./components/Timer";

export const Home: React.FC = () => {
  return (
    <MessageProvider>
      <div className={styles.container}>
        <div className="centering-item">
          <BmMessage />
          <Timer />
          <BookmarkManager />
        </div>
      </div>
    </MessageProvider>
  );
};

export default Home;
