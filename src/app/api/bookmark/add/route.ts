"use server";
import { SqliteError } from "better-sqlite3";

import { ALLOWED_CORS_ORIGIN } from "../../../constants/apiEndpoints";
import { getDb } from "../database";

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204, // No Content
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_CORS_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

export const POST: (request: Request) => Promise<Response> = async (
  request: Request
) => {
  const commonHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_CORS_ORIGIN,
  };

  try {
    const bookmark = await request.json();
    if (!bookmark.url || bookmark.url.trim() === "") {
      return new Response("URL cannot be empty", {
        status: 400,
        headers: commonHeaders,
      });
    }
    if (!bookmark.title || bookmark.title.trim() === "") {
      return new Response("Title cannot be empty", {
        status: 400,
        headers: commonHeaders,
      });
    }

    const db = getDb();
    const insertStmt = db.prepare(
      "INSERT INTO bookmarks (url, title) VALUES (?, ?)"
    );
    const result = insertStmt.run(bookmark.url, bookmark.title);
    return new Response(
      JSON.stringify({
        url: bookmark.url,
        title: bookmark.title,
        id: result.lastInsertRowid,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...commonHeaders },
      }
    );
  } catch (error: unknown) {
    if (
      error instanceof SqliteError &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return new Response(
        JSON.stringify({
          error: "指定されたURLのブックマークは既に登録されています。",
          message: "指定されたURLのブックマークは既に登録されています。",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json", ...commonHeaders },
        }
      );
    }
    return new Response((error as Error).message, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
        ...commonHeaders,
      },
    });
  }
};
