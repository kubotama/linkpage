import "@testing-library/jest-dom";
import ActualDatabase from "better-sqlite3"; // Import the actual library

import { Bookmark, createBookmark } from "../../../types/Bookmark";
import { getDb } from "../database";
import { POST } from "./route";

// We will mock getDb to return our in-memory instance.
// The actual getDb function is simple, but mocking allows us to inject the in-memory DB.
jest.mock("../database");

let inMemoryDbInstance: ActualDatabase.Database;

describe("ブックマーク追加APIのテスト (オンメモリDB)", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();

    // Create a new in-memory database for each test
    inMemoryDbInstance = new ActualDatabase(":memory:");
    // Initialize the schema (same as in the original database.ts)
    inMemoryDbInstance.exec(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL
      )
    `);

    // Configure the getDb mock to return this instance
    (getDb as jest.Mock).mockReturnValue(inMemoryDbInstance);
  });

  afterEach(() => {
    if (inMemoryDbInstance) {
      inMemoryDbInstance.close();
    }
  });

  // --- POST Tests ---

  it("POST: ブックマークのデータが追加できる", async () => {
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

    // Verify data in the in-memory database
    const stmt = inMemoryDbInstance.prepare(
      "SELECT url, title FROM bookmarks WHERE id = ?"
    );
    const dbData = stmt.get(json.id); // json.id comes from the response (lastInsertRowid)
    expect(dbData).toEqual({
      url: bookmark.url,
      title: bookmark.title,
    });
  });

  it("POST: ブックマークのデータを2回、追加できる", async () => {
    // 1回めの追加
    const bookmark1: Bookmark = createBookmark({
      url: "https://github.com/kubotama/linkpage",
      title: "kubotama/linkpage",
    });
    const response1 = await POST(
      new Request("http://localhost:3000/api/bookmark/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmark1),
      })
    );

    expect(response1.status).toBe(200);
    const json1 = await response1.json();
    expect(json1).toEqual({
      id: expect.any(Number),
      url: "https://github.com/kubotama/linkpage",
      title: "kubotama/linkpage",
    });

    // Verify data in the in-memory database
    const stmt1 = inMemoryDbInstance.prepare(
      "SELECT url, title FROM bookmarks WHERE id = ?"
    );
    const dbData1 = stmt1.get(json1.id); // json.id comes from the response (lastInsertRowid)
    expect(dbData1).toEqual({
      url: bookmark1.url,
      title: bookmark1.title,
    });

    // 2回めの追加
    const bookmark2: Bookmark = createBookmark({
      url: "https://www.google.com/",
      title: "Google",
    });
    const response2 = await POST(
      new Request("http://localhost:3000/api/bookmark/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmark2),
      })
    );

    expect(response2.status).toBe(200);
    const json2 = await response2.json();
    expect(json2).toEqual({
      id: expect.any(Number),
      url: "https://www.google.com/",
      title: "Google",
    });

    // Verify data in the in-memory database
    const stmt2 = inMemoryDbInstance.prepare(
      "SELECT url, title FROM bookmarks WHERE id = ?"
    );
    const dbData2 = stmt2.get(json2.id); // json.id comes from the response (lastInsertRowid)
    expect(dbData2).toEqual({
      url: bookmark2.url,
      title: bookmark2.title,
    });
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
    expect(text).toMatch(/Unexpected token|JSON.parse/i); // Check for JSON parsing error message
  });

  it("POST: 重複したURLのブックマーク追加時にデータベースエラーを返す", async () => {
    const initialBookmark = {
      url: "https://example.com",
      title: "Example",
    };
    // Pre-populate the database with one entry
    const insertStmt = inMemoryDbInstance.prepare(
      "INSERT INTO bookmarks (url, title) VALUES (?, ?)"
    );
    insertStmt.run(initialBookmark.url, initialBookmark.title);

    const bookmark: Bookmark = createBookmark({
      url: initialBookmark.url, // Same URL
      title: "Another Title For Same URL",
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

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toMatch(/UNIQUE constraint failed: bookmarks.url/i);
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
