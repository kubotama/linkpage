export const DB_SCHEMA = `
  CREATE TABLE IF NOT EXISTS bookmarks (
    bookmark_id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS keywords (
    keyword_id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword_name TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS bookmark_keywords (
    bookmark_keyword_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookmark_id INTEGER,
    keyword_id INTEGER,
    FOREIGN KEY (bookmark_id) REFERENCES bookmarks(bookmark_id) ON DELETE CASCADE,
    FOREIGN KEY (keyword_id) REFERENCES keywords(keyword_id) ON DELETE CASCADE
    UNIQUE (bookmark_id, keyword_id)
  );

  CREATE INDEX IF NOT EXISTS idx_bookmark_keywords_bookmark_id ON bookmark_keywords(bookmark_id);
  CREATE INDEX IF NOT EXISTS idx_bookmark_keywords_keyword_id ON bookmark_keywords(keyword_id);
  CREATE INDEX IF NOT EXISTS idx_bookmark_keywords_bookmark_id_keyword_id ON bookmark_keywords(bookmark_id, keyword_id);
  `;
