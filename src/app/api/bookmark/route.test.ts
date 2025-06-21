import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockBookmarks } from "../../types/Bookmark";
import { getDb } from "./database";
import { GET, POST } from "./route";

// Mock the better-sqlite3 library
vi.mock("better-sqlite3");

vi.mock("./database", () => ({
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
    mockAll.mockReturnValue(mockBookmarks); // GET returns our sample bookmarks

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

  it("GET: ブックマークのデータが取得できる", async () => {
    // Mocks are set up in beforeEach
    const bookmarksFromJson = mockAll(); // Get the data the mock returns

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(bookmarksFromJson);
    expect(mockPrepare).toHaveBeenCalledWith(
      "SELECT id, url, title FROM bookmarks"
    );
    expect(mockAll).toHaveBeenCalledTimes(2);
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

  // --- POST Tests ---

  it("POST: ブックマークのデータが更新できる", async () => {
    transaction: mockTransaction.mockImplementation((fn) => {
      // Mock transaction: it should return a function that, when called, executes the original function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...args: any) => fn(...args);
    });

    const response = await POST(
      new Request("http://localhost:3000/api/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBookmarks),
      })
    );

    expect(response.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalledTimes(1);

    // Check prepare calls within the transaction mock execution
    expect(mockPrepare).toHaveBeenCalledWith("DELETE FROM bookmarks");
    expect(mockPrepare).toHaveBeenCalledWith(
      "INSERT INTO bookmarks (url, title) VALUES (?, ?)"
    );

    // Check run calls: 1 for DELETE, N for INSERT
    expect(mockRun).toHaveBeenCalledTimes(1 + mockBookmarks.length);
    expect(mockRun).toHaveBeenNthCalledWith(1); // DELETE call
    expect(mockRun).toHaveBeenNthCalledWith(
      2,
      mockBookmarks[0].url,
      mockBookmarks[0].title
    ); // First INSERT
    expect(mockRun).toHaveBeenNthCalledWith(
      3,
      mockBookmarks[1].url,
      mockBookmarks[1].title
    ); // Second INSERT
    expect(mockClose).not.toHaveBeenCalled(); // Should not be called
  });

  it("POST: 不正なJSONデータの場合はエラーを返す", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      })
    );

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toMatch(/Unexpected token/i); // Check for JSON parsing error message
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockClose).not.toHaveBeenCalled(); // Should not be called if request.json() fails
  });

  it("POST: データベース書き込み(トランザクション)失敗時にエラーを返す", async () => {
    const dbWriteError = new Error("Transaction failed");
    mockTransaction.mockImplementation(() => () => {
      throw dbWriteError;
    }); // Make the function returned by transaction throw

    const response = await POST(
      new Request("http://localhost:3000/api/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBookmarks),
      })
    );

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe(dbWriteError.message);
    expect(mockClose).not.toHaveBeenCalled(); // Should not be called
  });
});
