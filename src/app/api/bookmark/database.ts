import Database from "better-sqlite3";

import { DB_SCHEMA } from "./schema";

const dbFile = "./bookmarks.sqlite";

let db: Database.Database | null = null;

export const getDb = () => {
  if (db === null) {
    db = new Database(dbFile);
    db.exec(DB_SCHEMA);
  }
  return db;
};
