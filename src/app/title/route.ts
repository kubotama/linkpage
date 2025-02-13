/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

export async function GET(url: string) {
  const response = await fetch("https://github.com/kubotama/linkpage");
  if (!response.ok) {
    throw new Error("Failed to fetch");
  }
  const text = await response.text();
  return new Response("link page", {
    status: 200,
    headers: { "Content-Type": "application/text" },
  });
}
