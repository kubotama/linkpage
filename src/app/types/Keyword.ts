export type Keyword = {
  keyword_id: number;
  keyword_name: string;
};

export const isKeyword = (obj: unknown): obj is Keyword => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "keyword_id" in obj &&
    typeof (obj as Keyword).keyword_id === "number" &&
    "keyword_name" in obj &&
    typeof (obj as Keyword).keyword_name === "string"
  );
};
