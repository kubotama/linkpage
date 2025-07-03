export const createErrorResponse = (
  message: string,
  status: number,
  log: string = "",
  headers: Record<string, string> = {}
): Response => {
  if (log) {
    console.error(log);
  }
  return new Response(JSON.stringify({ message }), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
};
