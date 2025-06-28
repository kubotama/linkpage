import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockKeywords } from "../../types/Keywords";
import { getDb } from "../bookmark/database";
import { GET } from "./route";

// Mock the better-sqlite3 library
vi.mock("better-sqlite3");

vi.mock("../bookmark/database", () => ({
  getDb: vi.fn(),
}));

describe("ブックマークのAPIのテスト", () => {
  // Define reusable mock implementations
  const mockPrepare = vi.fn();
  const mockAll = vi.fn();
  const mockRun = vi.fn();
  const mockExec = vi.fn();
  const mockTransaction = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Configure the mock Database constructor and methods
    (getDb as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      prepare: mockPrepare,
      all: mockAll, // Used in GET
      run: mockRun, // Used in POST (inside transaction)
      exec: mockExec, // Used in initializeDb
      transaction: mockTransaction,
      close: mockClose,
    }));

    // Default mock behavior for prepare -> all (for GET)
    mockPrepare.mockReturnValue({ all: mockAll });
    mockAll.mockReturnValue(mockKeywords); // GET returns our sample bookmarks

    // Default mock behavior for prepare -> run (for POST)
    // We need different prepare mocks for DELETE and INSERT
    mockPrepare.mockImplementation((sql: string) => {
      if (sql.toUpperCase().startsWith("DELETE")) {
        return { run: mockRun };
      }
      if (sql.toUpperCase().startsWith("INSERT")) {
        return { run: mockRun };
      }
      if (sql.toUpperCase().startsWith("SELECT")) {
        return { all: mockAll };
      }
      // Mock for CREATE TABLE in initializeDb
      if (sql.toUpperCase().startsWith("CREATE TABLE")) {
        return { run: mockRun }; // exec calls run internally in the mock? Let's assume exec works directly.
      }
      throw new Error(`Unhandled SQL in mockPrepare: ${sql}`);
    });
  });

  it("GET: キーワードのデータが取得できる", async () => {
    // Mocks are set up in beforeEach

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(mockKeywords);
    expect(mockPrepare).toHaveBeenCalledWith(
      "SELECT keyword_id, keyword_name FROM keywords"
    );
    expect(mockAll).toHaveBeenCalledTimes(1);
    expect(mockClose).not.toHaveBeenCalled(); // Should not be called
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
    expect(mockClose).not.toHaveBeenCalled(); // Should not be called if constructor fails
  });

  it("GET: クエリエラー時に500エラーを返す", async () => {
    const queryError = new Error("Failed to execute query");
    mockPrepare.mockImplementation(() => {
      throw queryError;
    });

    const response = await GET();
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toEqual(queryError.message);
    expect(mockClose).not.toHaveBeenCalled(); // Should not be called
  });
});
