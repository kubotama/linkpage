// src/app/api/utils/types.ts
import { expect } from "vitest";

export interface ErrorTestCase<T> {
  description: string;
  statusCode: number;
  errorMessage: string;
  logMessage: string | ReturnType<typeof expect.stringContaining>;
  requestBody?: unknown;
  body: T;
  setup?: () => void;
}
