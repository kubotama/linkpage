export type Keyword = {
  keyword_id: number;
  keyword_name: string;
};

export function createKeyword(
  keyword_id: number,
  keyword_name: string
): Keyword {
  return { keyword_id, keyword_name };
}

export function createKeywordList(keywordList: Keyword[]) {
  return keywordList.map(({ keyword_id, keyword_name }) =>
    createKeyword(keyword_id, keyword_name)
  );
}

export const mockKeywords: Keyword[] = createKeywordList([
  {
    keyword_id: 1,
    keyword_name: "キーワード1",
  },
  {
    keyword_id: 2,
    keyword_name: "キーワード2",
  },
  {
    keyword_id: 3,
    keyword_name: "キーワード3",
  },
  {
    keyword_id: 4,
    keyword_name: "キーワード4",
  },
]);
