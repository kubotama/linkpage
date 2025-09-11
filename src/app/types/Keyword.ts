// アプリケーション全体で安全に使用される公開用の型
export type Keyword = {
  keyword_id: number;
  keyword_name: string;
};

export const isKeyword = (obj: unknown): obj is Keyword => {
  if (obj === null || typeof obj !== "object") {
    return false;
  }
  const rec = obj as Record<string, unknown>;
  return typeof rec.keyword_id === "number" && typeof rec.keyword_name === "string";
};

export type KeywordPostParams = {
  params: Promise<{ bookmark_id: string; keyword_id: string }>;
};
