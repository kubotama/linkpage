export async function GET() {
  return new Response("180", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
