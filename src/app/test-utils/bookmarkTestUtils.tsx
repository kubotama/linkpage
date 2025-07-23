import { act } from "react";
import { expect } from "vitest";

import { fireEvent, screen, waitFor } from "@testing-library/react";

import { FORM_BOOKMARK_DETAIL, TITLE_ROLE_NAME, URL_ROLE_NAME } from "../constants/constants";
import { Bookmark } from "../types/Bookmark";
import { Keyword } from "../types/Keyword";

export function createBookmark({
  bookmark_id = 0,
  url = "",
  title = "",
  keywords = [],
}: Partial<Bookmark>): Bookmark {
  return { bookmark_id, url, title, keywords };
}

export function createBookmarkList(bookmarkList: Partial<Bookmark>[]) {
  return bookmarkList.map(createBookmark);
}

export const mockBookmarks: Bookmark[] = createBookmarkList([
  {
    bookmark_id: 1,
    url: "https://github.com/kubotama/linkpage",
    title: "kubotama/linkpage",
  },
  {
    bookmark_id: 2,
    url: "https://www.google.com/",
    title: "Google",
  },
  {
    bookmark_id: 3,
    url: "https://mail.google.com",
    title: "Gmail",
  },
  {
    bookmark_id: 4,
    url: "https://www.amazon.co.jp/",
    title: "Amazon",
  },
]);

export const assertBookmarkIsSelected = async (bookmark: Bookmark) => {
  await waitFor(() => {
    expect(screen.getByRole("textbox", { name: URL_ROLE_NAME })).toHaveValue(bookmark.url);
    expect(screen.getByRole("textbox", { name: TITLE_ROLE_NAME })).toHaveValue(bookmark.title);
  });
};

export const assertNoBookmarkIsSelected = async () => {
  await waitFor(() => {
    expect(screen.queryByRole("form", { name: FORM_BOOKMARK_DETAIL })).not.toBeInTheDocument();
  });
};

export const clickBookmark = async (bookmark: Bookmark) => {
  // クリックするブックマークを選択（例：2番目のブックマーク）
  // const bookmark = mockBookmarks[1]; // Google
  try {
    const cellWithTitle = screen.getByText(bookmark.title);

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(cellWithTitle);
    });
    await assertBookmarkIsSelected(bookmark);
  } catch (error) {
    // エラーメッセージに元のエラーを含めるとデバッグが容易になります
    console.error(error); // 元のエラーをログに出力
    throw new Error(
      `ブックマーク "${bookmark.title}" のテーブル行のクリック処理中にエラーが発生しました。`
    );
  }
};

export const mockKeywords: Keyword[] = [
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
];

export const mockBookmarkKeywords = [
  { bookmark_id: 2, keyword_id: 1 },
  { bookmark_id: 2, keyword_id: 2 },
  { bookmark_id: 3, keyword_id: 3 },
];

// Helper to construct expected keywords for each bookmark
const getExpectedKeywords = (bookmarkId: number) => {
  const associatedKeywordIds = mockBookmarkKeywords
    .filter((bk) => bk.bookmark_id === bookmarkId)
    .map((bk) => bk.keyword_id);
  return associatedKeywordIds.map((id) => {
    const keyword = mockKeywords.find((k) => k.keyword_id === id);
    if (!keyword) {
      throw new Error(`Test data inconsistency: Keyword with id ${id} not found in mockKeywords.`);
    }
    return keyword;
  });
};

export const expectEqualBookmark = (bookmark1: Bookmark, bookmark2: Bookmark) => {
  expect(bookmark1).toEqual(
    expect.objectContaining({
      bookmark_id: bookmark2.bookmark_id,
      url: bookmark2.url,
      title: bookmark2.title,
    })
  );
  const keywords = getExpectedKeywords(bookmark2.bookmark_id);
  expect(keywords).not.toBeUndefined();
  expect(bookmark1.keywords).toHaveLength(keywords.length);
  expect(bookmark1.keywords).toEqual(expect.arrayContaining(keywords));
};

export const buildMockBookmarksWithKeywords = (): Bookmark[] => {
  return mockBookmarks.map((bookmark) => {
    const keywords = getExpectedKeywords(bookmark.bookmark_id);
    return { ...bookmark, keywords };
  });
};

// export const getBookmarkByKeywords = (bookmarks: Bookmark[], numKeywords: number = 1): Bookmark => {
//   const bookmarkToSelect = bookmarks.find((b) => b.keywords.length > numKeywords);
//   if (!bookmarkToSelect) {
//     throw new Error(`No bookmark found with more than ${numKeywords} keywords.`);
//   }
//   return bookmarkToSelect;
// };

export const findBookmarkWithAtLeastNKeywords = (
  bookmarks: Bookmark[],
  minKeywords: number = 1
): Bookmark => {
  const bookmarkToSelect = bookmarks.find((b) => b.keywords.length >= minKeywords);
  if (!bookmarkToSelect) {
    throw new Error(`No bookmark found with at least ${minKeywords} keywords.`);
  }
  return bookmarkToSelect;
};
