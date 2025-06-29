export const createErrorResponse = (
  message: string,
  status: number
): Response => {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};
