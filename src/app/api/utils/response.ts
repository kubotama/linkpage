import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NOT_FOUND,
} from "../../constants/httpStatusCodes";

const ensureError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

export const createErrorResponse = (
  message: string,
  status: number,
  log: string = "",
  headers: Record<string, string> = {},
  statusText: string = ""
): Response => {
  if (log) {
    console.error(log);
  }
  return new Response(JSON.stringify({ message }), {
    status,
    statusText,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
};

// 共通のInvalidIdErrorハンドラー
export function createInvalidIdError(params: { id: string }) {
  return createErrorResponse(
    "IDは正の整数である必要があります。",
    HTTP_STATUS_BAD_REQUEST,
    `Invalid ID provided: ${params.id}. It must be a positive integer.`
  );
}

export const createInternalError = (error: unknown, headers: Record<string, string> = {}) => {
  return createErrorResponse(
    "サーバー内部でエラーが発生しました。",
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
    `Internal Server Error: ${ensureError(error).message}`,
    headers
  );
};

export const createNotFoundKeywordError = (keyword_id: number) => {
  return createErrorResponse(
    "指定されたキーワードが見つかりません。",
    HTTP_STATUS_NOT_FOUND,
    `Keyword with id: ${keyword_id} not found.`
  );
};

export const createNoUrlError = (headers: Record<string, string> = {}) => {
  return createErrorResponse(
    "URLを指定してください。",
    HTTP_STATUS_BAD_REQUEST,
    "URLが指定されていません。",
    headers
  );
};

export const createNoTitleError = (headers: Record<string, string> = {}) => {
  return createErrorResponse(
    "タイトルを指定してください。",
    HTTP_STATUS_BAD_REQUEST,
    "タイトルが指定されていません。",
    headers
  );
};

export const createDuplicateBookmarkError = (url: string, headers: Record<string, string> = {}) => {
  return createErrorResponse(
    "指定されたURLのブックマークは既に登録されています。",
    HTTP_STATUS_CONFLICT,
    `Bookmark with URL \"${url}\" already exists.`,
    headers
  );
};

export const createDuplicateKeywordError = (
  keyword: string,
  headers: Record<string, string> = {}
) => {
  return createErrorResponse(
    "指定されたキーワードは既に登録されています。",
    HTTP_STATUS_CONFLICT,
    `Keyword with \"${keyword}\" already exists.`,
    headers
  );
};

export const createInvalidBodyError = (error: unknown, headers: Record<string, string> = {}) => {
  return createErrorResponse(
    "リクエストボディのJSONが不正です。",
    HTTP_STATUS_BAD_REQUEST,
    `Invalid JSON format: ${ensureError(error).message}`,
    headers
  );
};

export const createNotFoundBookmarkError = (bookmark_id: number) => {
  return createErrorResponse(
    "指定されたブックマークがありません。",
    HTTP_STATUS_NOT_FOUND,
    `Bookmark with id: ${bookmark_id} not found.`
  );
};

export const createNoKeywordError = () => {
  return createErrorResponse(
    "キーワードを指定してください。",
    HTTP_STATUS_BAD_REQUEST,
    "キーワードが指定されていません。"
  );
};

export const createDuplicateKeywordAssociationError = (bookmarkId: number, keywordName: string) => {
  return createErrorResponse(
    "指定されたキーワードは既にこのブックマークに登録されています。",
    HTTP_STATUS_CONFLICT,
    `Keyword "${keywordName}" is already associated with bookmark id: ${bookmarkId}.`
  );
};
