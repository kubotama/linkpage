"use server";

import fs from "fs/promises";

const bookmark_filename = "./bookmark.json";

export async function GET() {
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

export async function POST(request: Request) {
  try {
    const bookmarks = await request.json();
    await fs.writeFile(bookmark_filename, JSON.stringify(bookmarks), "utf-8");
    return new Response(undefined, { status: 200 });
  } catch (error: unknown) {
    return new Response((error as Error).message, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
