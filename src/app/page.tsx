"use client";

import React from "react";

import { BookmarkManager } from "./components/BookmarkManager";
import { Timer } from "./components/Timer";
import styles from "./styles.module.css";

export const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className="centering-item">
        <Timer />
        <BookmarkManager />
      </div>
    </div>
  );
};

export default Home;
