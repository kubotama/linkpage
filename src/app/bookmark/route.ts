"use server";

import fs from "fs/promises";

export async function GET() {
  const bookmark_filename = "./bookmark.json";
  try {
    const bookmarks = await fs.readFile(bookmark_filename, "utf-8");
    JSON.parse(bookmarks);
    return new Response(bookmarks, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return new Response((error as Error).message, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
