import fs from "fs/promises";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { GET } from "./route";

const TEST_DB_PATH = "./test-timer.sqlite";

// テスト用のDBパスを使用するようにモック
jest.mock("../../filename", () => ({
  DB_PATH: "./test-timer.sqlite",
}));

describe("Timer API", () => {
  beforeEach(async () => {
    // テストDBの初期化
    const db = await open({
      filename: TEST_DB_PATH,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS timer_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        duration INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.close();
  });

  afterEach(async () => {
    // テストDBの削除
    try {
      await fs.unlink(TEST_DB_PATH);
    } catch (error) {
      console.error("Error cleaning up test database:", error);
    }
  });

  describe("GET", () => {
    it("データが存在しない場合、初期値の180を返す", async () => {
      const response = await GET();
      const data = await response.text();

      expect(response.status).toBe(200);
      expect(data).toBe("180");
    });

    it("最新のタイマー時間を返す", async () => {
      // テストデータの挿入
      const db = await open({
        filename: TEST_DB_PATH,
        driver: sqlite3.Database,
      });

      await db.run("INSERT INTO timer_logs (duration) VALUES (?)", [300]);
      await db.run("INSERT INTO timer_logs (duration) VALUES (?)", [240]);
      await db.close();

      const response = await GET();
      const data = await response.text();

      expect(response.status).toBe(200);
      expect(data).toBe("240");
    });
  });
});
