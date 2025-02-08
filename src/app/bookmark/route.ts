"use server";

import fs from "fs";

export async function GET() {
  return new Response(fs.readFileSync("./bookmark.json", "utf-8"), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
