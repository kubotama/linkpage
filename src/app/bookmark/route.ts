"use server";

import fs from "fs";

export async function GET() {
  const bookmark_filename = "./bookmark.json";
  try {
    const bookmarks = fs.readFileSync(bookmark_filename, "utf-8");
    JSON.parse(bookmarks);
    return new Response(bookmarks, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error instanceof Error)
      return new Response(error.message, {
        status: 500,
        headers: { "Content-Type": "application/plain" },
      });
  }
  // This code should not be executed
  return new Response("Should not be executed", {
    status: 500,
    headers: { "Content-Type": "application/plain" },
  });
}
