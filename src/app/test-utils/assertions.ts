// src/app/test-utils/assertions.ts
import { expect } from "vitest";

export const assertErrorResponse = async (
  response: Response,
  expectedStatus: number,
  expectedMessage: string
) => {
  expect(response.status).toBe(expectedStatus);
  const responseBody = (await response.json()) as { message: string };
  expect(responseBody.message).toBe(expectedMessage);
};
