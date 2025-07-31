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
    // false を返すことで、破損している可能性のある ID で続行しないことが保証されます。
    return false;
  }

  return "keyword_name" in maybeKeyword && typeof maybeKeyword.keyword_name === "string";
};
