import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import { TITLE_ROLE_NAME, UPDATE_BUTTON_ROLE_NAME, URL_ROLE_NAME } from "../../constants/constants";
import {
  clickBookmark,
  createBookmark,
  createMockResponse,
  mockBookmarks,
} from "../../test-utils/bookmarkTestUtils";
import { BookmarkManager } from "../BookmarkManager";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();

const inputTextAndClickUpdateButton = async (url: string, title: string) => {
  const updateButton = screen.getByRole("button", {
    name: UPDATE_BUTTON_ROLE_NAME,
  });
  const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
  const titleInput = screen.getByRole("textbox", { name: TITLE_ROLE_NAME });

  fireEvent.change(urlInput, { target: { value: url } });
  fireEvent.change(titleInput, { target: { value: title } });
  fireEvent.click(updateButton);
};

const expectTextAndButton = (url: string, title: string) => {
  const updateButton = screen.getByRole("button", {
    name: UPDATE_BUTTON_ROLE_NAME,
  });
  const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
  const titleInput = screen.getByRole("textbox", { name: TITLE_ROLE_NAME });

  expect(urlInput).toHaveValue(url);
  expect(titleInput).toHaveValue(title);
  expect(updateButton).toBeInTheDocument();
};

describe("タイトルの更新ボタン", () => {
  beforeEach(async () => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });

    render(<BookmarkManager />);

    // 初期データがロードされ、UIが安定するのを待つ
    // テーブル内に既知のブックマークのタイトルが表示されることを確認
    // また、アクションボタンが表示されていることで、メインUIの準備ができていることを確認
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });
  });

  it("ブックマークが選択されていない場合には、タイトルの更新ボタンは表示されない。", async () => {
    const updateButtons = screen.queryAllByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });

    await waitFor(() => {
      expect(updateButtons).toHaveLength(0);
    });
  });

  it("ブックマークが選択されている場合には、タイトルの更新ボタンが表示される。", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    await waitFor(() => {
      const updateButton = screen.getByRole("button", {
        name: UPDATE_BUTTON_ROLE_NAME,
      });
      expect(updateButton).toBeInTheDocument();
    });
  });

  it("ブックマークのタイトルが更新される。(APIの呼び出し、画面の更新)", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const updateUrl = "https://www.google.com/mail";
    const updateTitle = "更新されたタイトル";
    // 状態更新をトリガーするアクションの前に、APIのレスポンスをモックします
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        isOk: true,
        status: 204,
      })
    );

    inputTextAndClickUpdateButton(updateUrl, updateTitle);

    await waitFor(() => {
      // APIの呼び出しの確認
      expect(mockFetch).toHaveBeenCalledTimes(2); // beforeEachの1回 + 更新の1回
      expect(mockFetch.mock.lastCall![0]).toEqual(
        `${BOOKMARKS_ENDPOINT}/${bookmarkToSelect.bookmark_id}`
      );
      expect(mockFetch.mock.lastCall![1]).toEqual({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: updateUrl,
          title: updateTitle,
        }),
      });
      const updateText = screen.getAllByText(updateTitle);
      expect(updateText).toHaveLength(1);

      // 画面の更新の確認;
      expectTextAndButton(updateUrl, updateTitle);
    });

    const updatedBookmark: Bookmark = createBookmark({
      bookmark_id: bookmarkToSelect.bookmark_id,
      url: updateUrl,
      title: updateTitle,
      keywords: bookmarkToSelect.keywords,
    });
    await clickBookmark(updatedBookmark);
    await waitFor(() => {
      expectTextAndButton(updateUrl, updateTitle);
    });
  });

  it("同じURLを指定された場合には409を返す。", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const updateUrl = mockBookmarks[2].url;
    const updateTitle = "更新されたタイトル";
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        isOk: false,
        status: 409,
        message: "指定されたURLのブックマークは既に登録されています。",
      })
    );

    await inputTextAndClickUpdateButton(updateUrl, updateTitle);

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "指定されたURLのブックマークは既に登録されています。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
    });
  });

  it("登録されていないブックマークIDを指定された場合は404を返す。", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        isOk: false,
        status: 404,
        message: "指定されたブックマークがありません。",
      })
    );

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });

    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
    });
  });

  it("タイトルが指定されていない場合には400を返す。", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        isOk: false,
        status: 400,
        message: "タイトルが指定されていません。",
      })
    );

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });

    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
    });
  });

  it("IDが指定されていない場合には400を返す。", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        isOk: false,
        status: 400,
        message: "リクエストにIDがありませんでした。",
      })
    );

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });

    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
    });
  });

  it("不正な形式(文字列)のIDを指定された場合には400を返す。", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        isOk: false,
        status: 400,
        message: "IDは正の整数である必要があります。",
      })
    );

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });

    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
    });
  });

  it("不正なJSONデータの場合は500を返す。", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        isOk: false,
        status: 500,
        message: "サーバーで予期せぬエラーが発生しました。",
      })
    );

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });

    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
    });
  });
});
