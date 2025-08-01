// アプリケーション全体で安全に使用される公開用の型
export type Keyword = {
  keyword_id: number;
  keyword_name: string;
};

export const isKeyword = (obj: unknown): obj is Keyword => {
  if (obj === null || typeof obj !== "object") {
    return false;
  }
  const maybeKeyword = obj as Record<string, unknown>;
  if (!("keyword_id" in maybeKeyword)) {
    return false;
  }
  const maybeKeywordId = maybeKeyword.keyword_id;
  if (typeof maybeKeywordId !== "number") {
    return false;
  }

  return "keyword_name" in maybeKeyword && typeof maybeKeyword.keyword_name === "string";
};
