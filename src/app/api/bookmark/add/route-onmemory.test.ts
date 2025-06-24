import "@testing-library/jest-dom";

import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Bookmark, createBookmark } from "../../../types/Bookmark";
import { getDb } from "../database";
import { OPTIONS, POST } from "./route";

// We will mock getDb to return our in-memory instance.
// The actual getDb function is simple, but mocking allows us to inject the in-memory DB.
vi.mock("../database");

let inMemoryDbInstance: ActualDatabase.Database;

const API_URL = "http://localhost:3000/api/bookmark/add";

function createPostRequest(body: string): Request {
  return new Request(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });
}

describe("ブックマーク追加APIのテスト (オンメモリDB)", () => {
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
      )
    `);

    // Configure the getDb mock to return this instance
    (
      getDb as unknown as {
        mockReturnValue: (db: ActualDatabase.Database) => void;
      }
    ).mockReturnValue(inMemoryDbInstance);
  });

  afterEach(() => {
    if (inMemoryDbInstance) {
      inMemoryDbInstance.close();
    }
  });

  // --- POST Tests ---

  // Utility function to add a bookmark and verify the response
  async function addBookmarkAndVerify(bookmark: Bookmark) {
    const response = await POST(createPostRequest(JSON.stringify(bookmark)));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({
      id: expect.any(Number),
      url: bookmark.url,
      title: bookmark.title,
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
  }

  it("POST: ブックマークのデータが追加できる", async () => {
    await addBookmarkAndVerify(
      createBookmark({
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
      })
    );
  });

  it("POST: ブックマークのデータを2回、追加できる", async () => {
    await addBookmarkAndVerify(
      createBookmark({
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
      })
    );

    await addBookmarkAndVerify(
      createBookmark({
        url: "https://www.google.com/",
        title: "Google",
      })
    );
  });

  it("POST: 不正なJSONデータの場合はエラーを返す", async () => {
    const response = await POST(createPostRequest("invalid json"));

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toMatch(/Unexpected token|JSON.parse/i); // Check for JSON parsing error message
  });

  it("POST: 重複したURLのブックマーク追加時に409 Conflictを返す", async () => {
    const initialBookmark = {
      url: "https://example.com",
      title: "Example",
    };
    // Pre-populate the database with one entry
    // Ensure the in-memory DB schema includes the UNIQUE constraint
    inMemoryDbInstance.exec(`
      DROP TABLE IF EXISTS bookmarks;
      CREATE TABLE bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL
      )
    `);

    const insertStmt = inMemoryDbInstance.prepare(
      "INSERT INTO bookmarks (url, title) VALUES (?, ?)"
    );
    insertStmt.run(initialBookmark.url, initialBookmark.title);

    const bookmark: Bookmark = createBookmark({
      url: initialBookmark.url, // Same URL
      title: "同じURLで別のタイトル",
    });

    const response = await POST(createPostRequest(JSON.stringify(bookmark)));

    expect(response.status).toBe(409);
    const text = await response.text();
    expect(text).toEqual("指定されたURLのブックマークは既に登録されています。");
  });

  it("POST: URLが空文字の場合にエラーを返す", async () => {
    const bookmark: Bookmark = createBookmark({
      title: "Example",
    });

    const response = await POST(createPostRequest(JSON.stringify(bookmark)));

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toEqual("URL cannot be empty");
  });

  it("POST: タイトルが空文字の場合にエラーを返す", async () => {
    const bookmark: Bookmark = createBookmark({
      url: "https://example.com",
    });

    const response = await POST(createPostRequest(JSON.stringify(bookmark)));

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toEqual("Title cannot be empty");
  });

  // --- OPTIONS Tests ---
  it("OPTIONS: 適切なCORSヘッダーを返す", async () => {
    const response = await OPTIONS(); // OPTIONS handler might not take a request argument

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "chrome-extension://jonckoigjppkhajocdbgfbgjdgffhebf"
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
      "POST, OPTIONS"
    );
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
      "Content-Type"
    );
  });
});
