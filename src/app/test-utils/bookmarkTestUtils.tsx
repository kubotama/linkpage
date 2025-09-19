import { expect, MockInstance } from "vitest";

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { BookmarkManager } from "../components/BookmarkManager";
import {
  FORM_BOOKMARK_DETAIL,
  TABLE_NAME_BOOKMARKS,
  TITLE_ROLE_NAME,
  URL_ROLE_NAME,
} from "../constants/constants";
import {
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_MULTIPLE_CHOICES,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_OK,
} from "../constants/httpStatusCodes";
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

export const LINKPAGE_BOOKMARK: Bookmark = createBookmark({
  bookmark_id: 1,
  url: "https://github.com/kubotama/linkpage",
  title: "kubotama/linkpage",
});
export const GOOGLE_BOOKMARK: Bookmark = createBookmark({
  bookmark_id: 2,
  url: "https://www.google.com/",
  title: "Google",
});
export const GMAIL_BOOKMARK: Bookmark = createBookmark({
  bookmark_id: 3,
  url: "https://mail.google.com",
  title: "Gmail",
});
export const AMAZON_BOOKMARK: Bookmark = createBookmark({
  bookmark_id: 4,
  url: "https://www.amazon.co.jp/",
  title: "Amazon",
});

export const mockBookmarks: Bookmark[] = [
  LINKPAGE_BOOKMARK,
  GOOGLE_BOOKMARK,
  GMAIL_BOOKMARK,
  AMAZON_BOOKMARK,
];

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

export const GOOGLE_KEYWORD_1 = { bookmark_id: 2, keyword_id: 1 };
export const GOOGLE_KEYWORD_2 = { bookmark_id: 2, keyword_id: 2 };
export const GMAIL_KEYWORD_1 = { bookmark_id: 3, keyword_id: 3 };

export const mockBookmarkKeywords = [GOOGLE_KEYWORD_1, GOOGLE_KEYWORD_2, GMAIL_KEYWORD_1];

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

  const responseStatus = status ?? HTTP_STATUS_CREATED;
  const response: {
    ok: boolean;
    status: number;
    json?: () => Promise<Partial<MockResponseJson>>;
    text?: () => Promise<string>;
  } = {
    ok: isOk ?? (responseStatus >= HTTP_STATUS_OK && responseStatus < HTTP_STATUS_MULTIPLE_CHOICES),
    status: responseStatus,
  };

  // 204 No Contentのようなボディを持たないレスポンスを考慮
  if (responseStatus !== HTTP_STATUS_NO_CONTENT) {
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

export const typeInTextbox = async (user: UserEvent, name: string, value: string) => {
  const textbox = screen.getByRole("textbox", { name });
  await user.clear(textbox);
  if (value.length > 0) {
    await user.type(textbox, value);
  }
};

export const clickButtonByName = async (user: UserEvent, name: string) => {
  const button = screen.getByRole("button", { name });
  await user.click(button);
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
    await clickButtonByName(user, buttonName);
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

type setupBookmarkManagerForTestProps = {
  fetchForSetup: MockInstance;
  bookmarksForSetup?: Bookmark[];
  keywordsForSetup?: Keyword[];
};

/**
 * BookmarkManagerコンポーネントをレンダリングし、初期データがロードされるのを待つ
 */
export const setupBookmarkManagerForTest = async ({
  fetchForSetup,
  bookmarksForSetup = mockBookmarks,
  keywordsForSetup = mockKeywords,
}: setupBookmarkManagerForTestProps) => {
  fetchForSetup.mockReset();
  fetchForSetup.mockResolvedValueOnce({
    ok: true,
    status: HTTP_STATUS_OK,
    json: async () => bookmarksForSetup,
  });
  fetchForSetup.mockResolvedValueOnce({
    ok: true,
    status: HTTP_STATUS_OK,
    json: async () => keywordsForSetup,
  });
  render(<BookmarkManager />);
  await screen.findByRole("cell", { name: LINKPAGE_BOOKMARK.title });
  return userEvent.setup();
};

export const deselectBookmark = async (user: UserEvent) => {
  await keyDown(user, "{escape}");
};

interface AssertErrorMessageOptions {
  message: string;
  isError: boolean;
  isAsync: boolean;
}

export const assertErrorMessage = async ({
  message,
  isError,
  isAsync,
}: AssertErrorMessageOptions) => {
  const messageElement = isAsync
    ? await screen.findByTestId("bookmark-message")
    : screen.getByTestId("bookmark-message");
  expect(messageElement).toHaveTextContent(message);

  if (isError) {
    expect(messageElement).toHaveClass("text-red-500");
    expect(messageElement).not.toHaveClass("text-gray-800");
    expect(screen.getByRole("button", { name: "閉じる" })).toBeVisible();
  } else {
    expect(messageElement).not.toHaveClass("text-red-500");
    expect(messageElement).toHaveClass("text-gray-800");
    // 「閉じる」ボタンは非同期で消える可能性があるため、isAsyncの値に関わらず
    // waitForを使用して、ボタンが確実に存在しないことを検証します。
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "閉じる" })).not.toBeInTheDocument();
    });
  }
};

interface TestApiErrorHandlingParams {
  action: () => Promise<void>;
  errorCase: { message: string; status: number };
  mockFetch: MockInstance;
  consoleErrorSpy: MockInstance;
  errorMessage: string;
}

export const testApiErrorHandling = async ({
  action,
  errorCase,
  mockFetch,
  consoleErrorSpy,
  errorMessage,
}: TestApiErrorHandlingParams) => {
  mockFetch.mockResolvedValueOnce(
    createMockResponse({
      isOk: false,
      status: errorCase.status,
      message: errorCase.message,
    })
  );

  await action();

  await assertErrorMessage({
    message: errorCase.message,
    isError: true,
    isAsync: true,
  });

  const resolvedErrorClass =
    errorCase.status === HTTP_STATUS_CONFLICT ? "DuplicatedError" : "ApiError";

  expect(consoleErrorSpy).toHaveBeenCalledWith(
    errorMessage, // "ブックマークの更新エラー:" や "キーワードの追加エラー:" など
    `${resolvedErrorClass}: [${errorCase.status}] ${errorCase.message}`
  );
};
