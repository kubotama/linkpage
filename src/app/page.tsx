"use client";

import React from "react";

import { BookmarkManager } from "./components/BookmarkManager";
import styles from "./styles.module.css";

export const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <BookmarkManager className="centering-item" />
    </div>
  );
};

export default Home;
