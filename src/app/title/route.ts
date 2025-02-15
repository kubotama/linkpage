"use server";

import { JSDOM } from "jsdom";

export async function GET(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch");
  }
  const dom = new JSDOM(await response.text());
  const title = dom.window.document.title;
  if (!title) {
    throw new Error("Can't find title");
  }

  return new Response(title, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
