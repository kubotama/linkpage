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

// 共通のInvalidIdErrorハンドラー
export function createInvalidIdError(params: { id: string }) {
  return createErrorResponse(
    "IDは正の整数である必要があります。",
    400,
    `Invalid ID provided: ${params.id}. It must be a positive integer.`
  );
}

export const createInternalError = (
  error: unknown,
  headers: Record<string, string> = {}
) => {
  return createErrorResponse(
    "サーバー内部でエラーが発生しました。",
    500,
    `Internal Server Error: ${(error as Error).message}`,
    headers
  );
};

export const createNotFoundKeywordError = (keyword_id: string) => {
  return createErrorResponse(
    "指定されたキーワードが見つかりません。",
    404,
    `Keyword with id: ${keyword_id} not found.`
  );
};

export const createNoUrlError = (headers: Record<string, string> = {}) => {
  return createErrorResponse(
    "URLを指定してください。",
    400,
    "URLが指定されていません。",
    headers
  );
};

export const createNoTitleError = (headers: Record<string, string> = {}) => {
  return createErrorResponse(
    "タイトルを指定してください。",
    400,
    "タイトルが指定されていません。",
    headers
  );
};

export const createDuplicateBookmarkError = (
  url: string,
  headers: Record<string, string> = {}
) => {
  return createErrorResponse(
    "指定されたURLのブックマークは既に登録されています。",
    409,
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
    409,
    `Keyword with \"${keyword}\" already exists.`,
    headers
  );
};

export const createInvalidBodyError = (
  error: unknown,
  headers: Record<string, string> = {}
) => {
  return createErrorResponse(
    "リクエストボディのJSONが不正です。",
    400,
    `Invalid JSON format: ${(error as Error).message}`,
    headers
  );
};

export const createNotFoundBookmarkError = (bookmark_id: string) => {
  return createErrorResponse(
    "指定されたブックマークがありません。",
    404,
    `Bookmark with id: ${bookmark_id} not found.`
  );
};

export const createNoKeywordError = () => {
  return createErrorResponse(
    "キーワードを指定してください。",
    400,
    "キーワードが指定されていません。"
  );
};
