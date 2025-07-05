export const API_BASE_URL = "/api";

export const BOOKMARKS_ENDPOINT = `${API_BASE_URL}/bookmarks`;
export const KEYWORDS_ENDPOINT = `${API_BASE_URL}/keywords`;

export const ALLOWED_CORS_ORIGIN =
  process.env.ALLOWED_CORS_ORIGIN ||
  // 開発環境用のデフォルト値。本番環境では必ず環境変数 ALLOWED_CORS_ORIGIN で指定する。
  "chrome-extension://jonckoigjppkhajocdbgfbgjdgffhebf";
