import "@testing-library/jest-dom";

import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockKeywords } from "../../types/Keywords";
import { getDb } from "../bookmark/database";
import { GET } from "./route";

vi.mock("../bookmark/database");

let inMemoryDbInstance: ActualDatabase.Database;

describe("ブックマークのAPIのテスト", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Create a new in-memory database for each test
    inMemoryDbInstance = new ActualDatabase(":memory:");
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
    for (const keyword of mockKeywords) {
      insert.run(keyword.keyword_id, keyword.keyword_name);
    }
    vi.mocked(getDb).mockReturnValue(inMemoryDbInstance);

    afterEach(() => {
      if (inMemoryDbInstance) {
        inMemoryDbInstance.close();
      }
    });
  });

  it("GET: キーワードのデータが取得できる", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(mockKeywords);
  });

  it("GET: データベースエラー時に500エラーを返す", async () => {
    const dbError = new Error("Database connection failed");
    (getDb as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw dbError;
    });

    const response = await GET();
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toEqual(dbError.message);
  });

  it("GET: クエリエラー時に500エラーを返す", async () => {
    const queryError = new Error("Failed to execute query");
    // prepareメソッドをモックしてクエリエラーを発生させる
    const prepareSpy = vi
      .spyOn(inMemoryDbInstance, "prepare")
      .mockImplementation(() => {
        throw queryError;
      });

    const response = await GET();
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toEqual(queryError.message);

    prepareSpy.mockRestore();
  });
});
