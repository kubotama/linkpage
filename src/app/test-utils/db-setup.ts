import ActualDatabase from "better-sqlite3"; // Import the actual library

import { Keyword } from "../types/Keywords";

export const setupInMemoryDb = (keywords: Keyword[]) => {
  // Create a new in-memory database for each test
  const inMemoryDbInstance = new ActualDatabase(":memory:");
  // Initialize the schema (same as in the original database.ts)
  inMemoryDbInstance.exec(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS keywords (
        keyword_id INTEGER PRIMARY KEY AUTOINCREMENT,
        keyword_name TEXT NOT NULL UNIQUE
      );
    `);

  const insert = inMemoryDbInstance.prepare(`
                      INSERT INTO keywords (keyword_id, keyword_name) VALUES (?, ?)
                  `);
  for (const keyword of keywords) {
    insert.run(keyword.keyword_id, keyword.keyword_name);
  }
  return inMemoryDbInstance;
};
