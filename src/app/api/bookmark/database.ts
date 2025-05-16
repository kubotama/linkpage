import Database from "better-sqlite3";

const dbFile = "./bookmarks.sqlite";

let db: Database.Database | null = null;

export const getDb = () => {
  if (db === null) {
    db = new Database(dbFile);
    db.exec(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL
      )
    `);
  }
  return db;
};
