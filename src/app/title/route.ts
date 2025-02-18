"use server";

import { JSDOM } from "jsdom";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new Response("Can't find url", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
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
