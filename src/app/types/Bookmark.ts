import { Keyword, isKeyword } from "./Keyword";

export type Bookmark = {
  bookmark_id: number;
  url: string;
  title: string;
  keywords: Keyword[];
};

export type IncomingBookmarkPayload = {
  url: string;
  title: string;
  keywords?: string[]; // クライアントからはkeywordsがオプションであるため、? を付けます
};

export type SelectedBookmarkIndex = number | undefined;
export type SelectedBookmark = Bookmark | undefined;

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

/**
 * ブックマークに指定されたキーワードが含まれているかを確認します。
 * @param bookmark - 確認対象のブックマークオブジェクト
 * @param keywordIdentifier - キーワード名(string)またはキーワードID(number)
 * @returns キーワードが含まれていればtrue、そうでなければfalse
 */
export const hasKeyword = (bookmark: Bookmark, keywordIdentifier: string | number): boolean => {
  if (!bookmark.keywords) {
    return false;
  }

  const key: keyof Keyword = typeof keywordIdentifier === "string" ? "keyword_name" : "keyword_id";
  return bookmark.keywords.some((k) => k[key] === keywordIdentifier);
};
