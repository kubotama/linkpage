import ActualDatabase from "better-sqlite3"; // Import the actual library

import { DB_SCHEMA } from "../api/bookmarks/schema";
import { mockBookmarks, mockKeywords, mockBookmarkKeywords } from "../test-utils/bookmarkTestUtils";

export const setupInMemoryDb = () => {
  // Create a new in-memory database for each test
  const inMemoryDbInstance = new ActualDatabase(":memory:");
  inMemoryDbInstance.exec(DB_SCHEMA);

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
    for (const bk of mockBookmarkKeywords) insertBookmarkKeyword.run(bk);
  })();

  return inMemoryDbInstance;
};
