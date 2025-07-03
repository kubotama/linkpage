export const createErrorResponse = (
  message: string,
  status: number,
  log: string = "",
  headers: Record<string, string> = {}
): Response => {
  if (log) {
    console.error(log);
  }
  if (Object.keys(headers).length === 0) {
    headers = { "Content-Type": "application/json" };
  } else {
    headers["Content-Type"] = "application/json";
  }
  return new Response(JSON.stringify({ message }), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
};
