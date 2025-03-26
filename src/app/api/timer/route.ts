export async function GET() {
  const durationTime = 180;
  return new Response(durationTime.toString(), {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
