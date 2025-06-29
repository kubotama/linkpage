import ActualDatabase from "better-sqlite3"; // Import the actual library

import { DB_SCHEMA } from "../api/bookmark/schema";
import { Keyword } from "../types/Keywords";

export const setupInMemoryDb = (keywords: Keyword[]) => {
  // Create a new in-memory database for each test
  const inMemoryDbInstance = new ActualDatabase(":memory:");
  inMemoryDbInstance.exec(DB_SCHEMA);
  const insert = inMemoryDbInstance.prepare(`
                      INSERT INTO keywords (keyword_id, keyword_name) VALUES (?, ?)
                  `);
  inMemoryDbInstance.exec("BEGIN TRANSACTION;");
  try {
    for (const keyword of keywords) {
      insert.run(keyword.keyword_id, keyword.keyword_name);
    }
    inMemoryDbInstance.exec("COMMIT;");
  } catch (error) {
    inMemoryDbInstance.exec("ROLLBACK;");
    console.error("トランザクション失敗:", error);
    throw error; // エラーを再スローして、呼び出し元に失敗を伝える
  }

  return inMemoryDbInstance;
};
