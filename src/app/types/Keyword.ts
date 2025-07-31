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
  if (typeof maybeKeywordId !== "number" && typeof maybeKeywordId !== "bigint") {
    return false;
  }
  if (maybeKeywordId > BigInt(Number.MAX_SAFE_INTEGER)) {
    // JSONはbigintをサポートしておらず、このIDはnumberとして安全に表現するには大きすぎます。
    // 破損したIDを返すよりも、エラーをスローする方が安全です。
    console.error(`Keyword ID is too large to be a safe integer: ${maybeKeyword.keyword_id}`);
    return false;
  }

  return "keyword_name" in maybeKeyword && typeof maybeKeyword.keyword_name === "string";
};
