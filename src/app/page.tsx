"use client";

import React from "react";

import { BookmarkManager } from "./components/BookmarkManager";
import styles from "./styles.module.css";

export const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className="centering-item">
        <BookmarkManager />
      </div>
    </div>
  );
};

export default Home;
