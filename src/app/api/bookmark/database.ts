import Database from "better-sqlite3";

const dbFile = "./bookmarks.sqlite";

// export const getDb = () => {
//   const db = new Database(dbFile);
//   // テーブルが存在しない場合のみ作成
//   db.exec(`
//     CREATE TABLE IF NOT EXISTS bookmarks (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       url TEXT NOT NULL UNIQUE,
//       title TEXT NOT NULL
//     )
//   `);
//   return db;
// };
// const db = new Database(dbFile);
// // テーブルが存在しない場合のみ作成
// db.exec(`
//   CREATE TABLE IF NOT EXISTS bookmarks (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     url TEXT NOT NULL UNIQUE,
//     title TEXT NOT NULL
//   )
// `);
let db: InstanceType<typeof Database> | null = null;

export const getDb = () => {
  if (db === null) {
    db = new Database(dbFile);
    db.exec(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL
      )
    }`);
  }
  return db;
};
