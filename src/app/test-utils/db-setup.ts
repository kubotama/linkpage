import ActualDatabase from "better-sqlite3"; // Import the actual library

import { DB_SCHEMA } from "../api/bookmark/schema";
import { Bookmark, mockBookmarks } from "../types/Bookmark";
import { Keyword, mockKeywords } from "../types/Keywords";

export const setupInMemoryDb = () => {
  // Create a new in-memory database for each test
  const inMemoryDbInstance = new ActualDatabase(":memory:");
  inMemoryDbInstance.exec(DB_SCHEMA);
  const insertKeyword = inMemoryDbInstance.prepare(`
                      INSERT INTO keywords (keyword_id, keyword_name) VALUES (?, ?)
                  `);
  const insertKeywordMany = inMemoryDbInstance.transaction(
    (keywords: Keyword[]) => {
      for (const keyword of keywords) {
        insertKeyword.run(keyword.keyword_id, keyword.keyword_name);
      }
    }
  );
  insertKeywordMany(mockKeywords);

  const insertBookmark = inMemoryDbInstance.prepare(`
                INSERT INTO bookmarks (url, title) VALUES (?, ?)
            `);
  const insertBookmarkMany = inMemoryDbInstance.transaction(
    (bookmarks: Bookmark[]) => {
      for (const bookmark of bookmarks) {
        insertBookmark.run(bookmark.url, bookmark.title);
      }
    }
  );
  insertBookmarkMany(mockBookmarks);

  return inMemoryDbInstance;
};
