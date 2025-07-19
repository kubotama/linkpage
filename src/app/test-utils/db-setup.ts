import ActualDatabase from "better-sqlite3"; // Import the actual library

import { DB_SCHEMA } from "../api/bookmarks/schema";
import { mockBookmarks } from "../types/Bookmark";
import { mockKeywords } from "../types/Keywords";

export const setupInMemoryDb = () => {
  // Create a new in-memory database for each test
  const inMemoryDbInstance = new ActualDatabase(":memory:");
  inMemoryDbInstance.exec(DB_SCHEMA);

  const bookmark_keywords = [
    { bookmark_id: 2, keyword_id: 1 },
    { bookmark_id: 2, keyword_id: 2 },
    { bookmark_id: 3, keyword_id: 3 },
  ];

  const insertBookmark = inMemoryDbInstance.prepare(
    "INSERT INTO bookmarks (bookmark_id, url, title) VALUES (@bookmark_id, @url, @title)"
  );
  const insertKeyword = inMemoryDbInstance.prepare(
    "INSERT INTO keywords (keyword_id, keyword_name) VALUES (@keyword_id, @keyword_name)"
  );
  const insertBookmarkKeyword = inMemoryDbInstance.prepare(
    "INSERT INTO bookmark_keywords (bookmark_id, keyword_id) VALUES (@bookmark_id, @keyword_id)"
  );

  inMemoryDbInstance.transaction(() => {
    for (const bookmark of mockBookmarks) insertBookmark.run(bookmark);
    for (const keyword of mockKeywords) insertKeyword.run(keyword);
    for (const bk of bookmark_keywords) insertBookmarkKeyword.run(bk);
  })();

  return inMemoryDbInstance;
};
