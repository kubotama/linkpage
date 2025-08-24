import { expect } from "vitest";

import { render, screen, waitFor, within } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";

import { BookmarkManager } from "../components/BookmarkManager";
import {
  FORM_BOOKMARK_DETAIL,
  TABLE_NAME_BOOKMARKS,
  TITLE_ROLE_NAME,
  URL_ROLE_NAME,
} from "../constants/constants";
import { Bookmark } from "../types/Bookmark";
import { Keyword } from "../types/Keyword";

/** モックレスポンスのJSONボディの型 */
interface MockResponseJson {
  message: string;
  keyword_id?: number;
  bookmark_keyword_id?: number;
  keyword_name?: string;
}

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

export const getCellWithTitle = (title: string) => {
  const table = screen.getByRole("table", { name: TABLE_NAME_BOOKMARKS });

  const cellWithTitle = within(table).getByRole("cell", { name: title });
  return cellWithTitle;
};

export const clickBookmark = async (user: UserEvent, bookmark: Bookmark) => {
  // クリックするブックマークを選択（例：2番目のブックマーク）
  // const bookmark = mockBookmarks[1]; // Google
  try {
    const cellWithTitle = getCellWithTitle(bookmark.title);
    const row = cellWithTitle.closest("tr");
    if (!row) {
      throw new Error(`ブックマーク "${bookmark.title}" のテーブル行が見つかりませんでした。`);
    }

    // テーブル行のクリックをシミュレート
    await user.click(row);
  } catch (error) {
    throw new Error(`ブックマーク "${bookmark.title}" の選択処理中にエラーが発生しました。`, {
      cause: error,
    });
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

interface CreateMockResponseOptions {
  message?: string;
  keyword_name?: string;
  isOk?: boolean;
  status?: number;
  keyword_id?: number;
  bookmark_keyword_id?: number;
}

export const createMockResponse = ({
  message,
  keyword_name,
  isOk,
  status,
  keyword_id,
  bookmark_keyword_id,
}: CreateMockResponseOptions = {}) => {
  const DEFAULT_KEYWORD_ID = 1;
  const DEFAULT_BOOKMARK_KEYWORD_ID = 123;
  const responseStatus = status ?? 201;
  const response: {
    ok: boolean;
    status: number;
    json?: () => Promise<Partial<MockResponseJson>>;
    text?: () => Promise<string>;
  } = {
    ok: isOk ?? (responseStatus >= 200 && responseStatus < 300),
    status: responseStatus,
  };

  // 204 No Contentのようなボディを持たないレスポンスを考慮
  if (responseStatus !== 204) {
    const body: Partial<MockResponseJson> = {};
    if (message !== undefined) {
      body.message = message;
    }
    // キーワード成功応答の場合のみ、関連フィールドを追加
    if (keyword_name !== undefined) {
      body.keyword_name = keyword_name;
      body.keyword_id = keyword_id ?? DEFAULT_KEYWORD_ID;
      body.bookmark_keyword_id = bookmark_keyword_id ?? DEFAULT_BOOKMARK_KEYWORD_ID;
    }
    response.json = async () => body;
    response.text = async () => JSON.stringify(body);
  }

  return response;
};

const typeInTextbox = async (user: UserEvent, name: string, value: string) => {
  const textbox = screen.getByRole("textbox", { name });
  await user.clear(textbox);
  if (value.length > 0) {
    await user.type(textbox, value);
  }
};

export const setBookmarkFormValuesAndClickButton = async (
  user: UserEvent,
  values: {
    url?: string;
    title?: string;
  },
  buttonName?: string
) => {
  if (values.url !== undefined) {
    await typeInTextbox(user, URL_ROLE_NAME, values.url);
  }
  if (values.title !== undefined) {
    await typeInTextbox(user, TITLE_ROLE_NAME, values.title);
  }
  if (buttonName !== undefined) {
    await user.click(screen.getByRole("button", { name: buttonName }));
  }
};

const assertHaveValueByRole = async (roleName: string, name: string, value: string) => {
  await waitFor(() => {
    const element = screen.getByRole(roleName, { name });
    expect(element).toHaveValue(value);
  });
};

export const expectBookmarkFormValues = async (values: {
  url?: string;
  title?: string;
  buttonName?: string;
}) => {
  if (values.url !== undefined) {
    await assertHaveValueByRole("textbox", URL_ROLE_NAME, values.url);
  }
  if (values.title !== undefined) {
    await assertHaveValueByRole("textbox", TITLE_ROLE_NAME, values.title);
  }
  if (values.buttonName !== undefined) {
    await screen.findByRole("button", { name: values.buttonName });
  }
};

export const keyDown = async (user: UserEvent, key: string) => {
  // テキストボックスなどへのフォーカスを外す
  await user.click(document.body);
  await user.keyboard(key);
};

export const setBookmarkFormValuesAndEnterKeydown = async (user: UserEvent, url: string) => {
  const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });

  await user.clear(urlInput);
  await user.type(urlInput, url);
  await keyDown(user, "{enter}");
};

/**
 * BookmarkManagerコンポーネントをレンダリングし、初期データがロードされるのを待つ
 */
export const setupBookmarkManagerForTest = async () => {
  render(<BookmarkManager />);
  await screen.findByRole("cell", { name: mockBookmarks[0].title });
};

export const deselectBookmark = async (user: UserEvent) => {
  await keyDown(user, "{escape}");
};
