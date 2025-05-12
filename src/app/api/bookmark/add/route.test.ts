import "@testing-library/jest-dom";

import {
  Bookmark,
  createBookmark,
  createBookmarkList,
} from "../../../types/Bookmark";
import { getDb } from "../database";
import { POST } from "./route";

// Mock the better-sqlite3 library
jest.mock("better-sqlite3");

jest.mock("../database", () => ({
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

  // --- POST Tests ---

  it("POST: ブックマークのデータが更新できる", async () => {
    mockRun.mockReturnValue({ lastInsertRowid: 1 });

    const bookmark: Bookmark = createBookmark({
      url: "https://github.com/kubotama/linkpage",
      title: "kubotama/linkpage",
    });
    const response = await POST(
      new Request("http://localhost:3000/api/bookmark/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmark),
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({
      id: expect.any(Number),
      url: "https://github.com/kubotama/linkpage",
      title: "kubotama/linkpage",
    });

    // Check prepare calls within the transaction mock execution
    expect(mockPrepare).toHaveBeenCalledWith(
      "INSERT INTO bookmarks (url, title) VALUES (?, ?)"
    );

    // Check run calls: 1 for INSERT
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(mockRun).toHaveBeenNthCalledWith(1, bookmark.url, bookmark.title); // First INSERT
    // expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("POST: 不正なJSONデータの場合はエラーを返す", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/bookmark/add", {
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
    const bookmark: Bookmark = createBookmark({
      url: "https://example.com",
      title: "Example",
    });
    const dbWriteError = new Error("Transaction failed");
    mockRun.mockImplementation(() => {
      throw dbWriteError;
    }); // Make the function returned by transaction throw

    const response = await POST(
      new Request("http://localhost:3000/api/bookmark/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmark),
      })
    );

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe(dbWriteError.message);
    // expect(mockClose).toHaveBeenCalledTimes(1); // Close should still be called in finally
  });

  it("POST: URLが空文字の場合にエラーを返す", async () => {
    const bookmark: Bookmark = createBookmark({
      title: "Example",
    });

    const response = await POST(
      new Request("http://localhost:3000/api/bookmark/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmark),
      })
    );

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe("URL cannot be empty");
  });

  it("POST: タイトルが空文字の場合にエラーを返す", async () => {
    const bookmark: Bookmark = createBookmark({
      url: "https://example.com",
    });

    const response = await POST(
      new Request("http://localhost:3000/api/bookmark/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmark),
      })
    );

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe("Title cannot be empty");
  });
});
