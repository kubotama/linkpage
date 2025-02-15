"use server";

import { JSDOM } from "jsdom";

export async function GET(url: string) {
  try {
    const response = await fetch(url);
    const dom = new JSDOM(await response.text());
    const title = dom.window.document.title;
    if (!title) {
      return new Response("Can't find title", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
    return new Response(title, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch {
    return new Response("Failed to fetch", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
