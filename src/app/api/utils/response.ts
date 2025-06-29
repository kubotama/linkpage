export const createErrorResponse = (
  message: string,
  status: number,
  log: string = ""
): Response => {
  if (log) {
    console.error(log);
  }
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};
