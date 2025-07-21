import { Keyword } from "./Keyword";

export type Bookmark = {
  bookmark_id: number;
  url: string;
  title: string;
  keywords?: Keyword[];
};

export type SelectedBookmarkIndex = number | undefined;
export type SelectedBookmark = Bookmark | undefined;

function isKeyword(obj: unknown): obj is Keyword {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "keyword_id" in obj &&
    "keyword_name" in obj &&
    typeof obj.keyword_id === "number" &&
    typeof obj.keyword_name === "string"
  );
}

function isKeywordArray(arr: unknown): arr is Keyword[] {
  return Array.isArray(arr) && arr.every(isKeyword);
}

export function parseAndValidateKeywords(jsonString: string): Keyword[] {
  try {
    const parsed = JSON.parse(jsonString);
    if (isKeywordArray(parsed)) {
      return parsed;
    } else {
      // JSONのパースは成功したが、期待するKeyword[]の構造ではない場合
      console.warn("Parsed keywords are not a valid Keyword[] array:", jsonString);
      return []; // 安全のために空の配列を返す
    }
  } catch (e) {
    // JSONのパース自体が失敗した場合 (例: 無効なJSON文字列)
    console.error("Failed to parse keywords JSON string:", jsonString, e);
    return []; // 安全のために空の配列を返す
  }
}
