import "@testing-library/jest-dom";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { getDb } from "./database";
import { GET, POST } from "./route";

// Mock the better-sqlite3 library
jest.mock("better-sqlite3");

jest.mock("./database", () => ({
  getDb: jest.fn(),
}));

describe("ブックマークのAPIのテスト", () => {
  // Define reusable mock implementations
  const mockPrepare = jest.fn();
  const mockAll = jest.fn();
  const mockRun = jest.fn();
  const mockExec = jest.fn();
  const mockTransaction = jest.fn();
  const mockClose = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();

    const bookmarks: Bookmark[] = createBookmarkList([
      {
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
      },
      {
        url: "https://www.google.com/",
        title: "Google",
      },
      {
        url: "https://mail.google.com",
        title: "Gmail",
      },
      {
        url: "https://www.amazon.co.jp/",
        title: "Amazon",
      },
    ]);

    // Configure the mock Database constructor and methods
    (getDb as unknown as jest.Mock).mockImplementation(() => ({
      prepare: mockPrepare,
      all: mockAll, // Used in GET
      run: mockRun, // Used in POST (inside transaction)
      exec: mockExec, // Used in initializeDb
      transaction: mockTransaction,
      close: mockClose,
    }));

    // Default mock behavior for prepare -> all (for GET)
    mockPrepare.mockReturnValue({ all: mockAll });
    mockAll.mockReturnValue(bookmarks); // GET returns our sample bookmarks

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
      "SELECT url, title FROM bookmarks"
    );
    expect(mockAll).toHaveBeenCalledTimes(2);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("GET: データベースエラー時に500エラーを返す", async () => {
    const dbError = new Error("Database connection failed");
    (getDb as unknown as jest.Mock).mockImplementation(() => {
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
    expect(mockClose).toHaveBeenCalledTimes(1); // Close should still be called in finally
  });

  // --- POST Tests ---

  it("POST: ブックマークのデータが更新できる", async () => {
    transaction: mockTransaction.mockImplementation((fn) => {
      // Mock transaction: it should return a function that, when called, executes the original function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...args: any) => fn(...args);
    });

    const bookmarks: Bookmark[] = createBookmarkList([
      {
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
      },
      {
        url: "https://www.google.com/",
        title: "Google",
      },
    ]);

    const response = await POST(
      new Request("http://localhost:3000/api/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmarks),
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
    expect(mockRun).toHaveBeenCalledTimes(1 + bookmarks.length);
    expect(mockRun).toHaveBeenNthCalledWith(1); // DELETE call
    expect(mockRun).toHaveBeenNthCalledWith(
      2,
      bookmarks[0].url,
      bookmarks[0].title
    ); // First INSERT
    expect(mockRun).toHaveBeenNthCalledWith(
      3,
      bookmarks[1].url,
      bookmarks[1].title
    ); // Second INSERT
    expect(mockClose).toHaveBeenCalledTimes(1);
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
    const bookmarks: Bookmark[] = createBookmarkList([
      { url: "https://example.com", title: "Example" },
    ]);
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
        body: JSON.stringify(bookmarks),
      })
    );

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe(dbWriteError.message);
    expect(mockClose).toHaveBeenCalledTimes(1); // Close should still be called in finally
  });
});
