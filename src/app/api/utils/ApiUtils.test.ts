import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} from "../../constants/httpStatusCodes";
import {
  ApiError,
  ERROR_MESSAGE_NOT_EXIST_OR_EMPTY,
  ERROR_MESSAGE_PARSE_JSON,
  ERROR_MESSAGE_READ_RESPONSE_BODY,
  ERROR_UNEXPECTED_RESPONSE_FORMAT,
  parseApiError,
} from "./ApiUtils";
import { createErrorResponse } from "./response";

describe("ApiUtils", () => {
  describe("parseApiError", () => {
    let consoleWarnSpy: MockInstance;
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      // consoleへの出力をモック化して、テスト結果をクリーンに保つ
      consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      // 各テスト後にモックをリセット
      vi.restoreAllMocks();
    });

    it("有効なJSON形式のエラーレスポンスのメッセージを解析する", async () => {
      const responseMessage = "invalid message";

      const response = createErrorResponse(responseMessage, HTTP_STATUS_BAD_REQUEST);

      const error = await parseApiError(response);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(HTTP_STATUS_BAD_REQUEST);
      expect(error.message).toBe(responseMessage);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it.each([
      {
        description: "messageフィールドがない場合",
        responseBody: { error: "不正なフォーマット" },
      },
      {
        description: "messageフィールドが空文字列の場合",
        responseBody: { message: "   " }, // 空白のみのメッセージ
      },
    ])("JSON形式のレスポンスの処理: $description", async ({ responseBody }) => {
      const response = new Response(JSON.stringify(responseBody), {
        status: HTTP_STATUS_BAD_REQUEST,
        statusText: "invalid request",
        headers: { "Content-Type": "application/json" },
      });

      const error = await parseApiError(response);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(HTTP_STATUS_BAD_REQUEST);
      expect(error.message).toBe(
        `${ERROR_UNEXPECTED_RESPONSE_FORMAT} ステータス: ${response.status} ${response.statusText}`
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `${ERROR_MESSAGE_NOT_EXIST_OR_EMPTY} ステータス: ${response.status}`
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
    });

    it("JSON形式でないレスポンスボディを処理する", async () => {
      const serverError = "Internal Server Error";
      const response = new Response(serverError, {
        status: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        statusText: "Server Error",
      });

      const error = await parseApiError(response);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(HTTP_STATUS_INTERNAL_SERVER_ERROR);
      expect(error.message).toBe(
        `${ERROR_MESSAGE_PARSE_JSON} ステータス: ${response.status} ${response.statusText}`
      );
      expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `${ERROR_MESSAGE_PARSE_JSON} ステータス: ${response.status}`,
        expect.any(SyntaxError)
      );
      expect(error.cause).toBeInstanceOf(SyntaxError);
    });

    it("レスポンスボディの読み取りエラーを処理する", async () => {
      const readError = new Error("Stream read error");
      const errorStream = new ReadableStream({
        start(controller) {
          controller.error(readError);
        },
      });

      const response = new Response(errorStream, {
        status: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        statusText: "Internal Server Error",
      });

      const error = await parseApiError(response);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(response.status);
      expect(error.message).toBe(
        `${ERROR_MESSAGE_READ_RESPONSE_BODY} ステータス: ${response.status} ${response.statusText}`
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(ERROR_MESSAGE_READ_RESPONSE_BODY),
        readError
      );
      expect(error.cause).toBe(readError);
    });
  });
});
