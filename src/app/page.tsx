"use client";

import React from "react";

import styles from "./styles.module.css";
import { Timer } from "./components/Timer";
import { BookmarkManager } from "./components/BookmarkManager";

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
