import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { screen, waitFor, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import { UPDATE_BUTTON_ROLE_NAME } from "../../constants/constants";
import {
  clickBookmark,
  createBookmark,
  createMockResponse,
  expectBookmarkFormValues,
  mockBookmarks,
  setBookmarkFormValuesAndClickButton,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();

const clickUpdateButton = async (user: UserEvent) => {
  const updateButton = screen.getByRole("button", {
    name: UPDATE_BUTTON_ROLE_NAME,
  });

  await user.click(updateButton);
};

describe("タイトルの更新ボタン", () => {
  let user: UserEvent;

  beforeEach(async () => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
    user = userEvent.setup();

    await setupBookmarkManagerForTest();
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

    await setBookmarkFormValuesAndClickButton(
      user,
      { url: updateUrl, title: updateTitle },
      UPDATE_BUTTON_ROLE_NAME
    );

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
      expectBookmarkFormValues({ url: updateUrl, title: updateTitle });
    });

    const updatedBookmark: Bookmark = createBookmark({
      bookmark_id: bookmarkToSelect.bookmark_id,
      url: updateUrl,
      title: updateTitle,
      keywords: bookmarkToSelect.keywords,
    });
    await clickBookmark(updatedBookmark);
    await waitFor(() => {
      expectBookmarkFormValues({ url: updateUrl, title: updateTitle });
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

    await setBookmarkFormValuesAndClickButton(
      user,
      { url: updateUrl, title: updateTitle },
      UPDATE_BUTTON_ROLE_NAME
    );

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "指定されたURLのブックマークは既に登録されています。"
      );
      // フォームに入力した値が保持され、更新ボタンが表示されていることを確認
      expectBookmarkFormValues({
        url: updateUrl,
        title: updateTitle,
        buttonName: UPDATE_BUTTON_ROLE_NAME,
      });
      // リスト上の元のブックマークが消えていないことを確認
      const table = screen.getByRole("table", { name: "bookmarks" });
      const bookmark = within(table).getByText(bookmarkToSelect.title);
      expect(bookmark).toBeInTheDocument();
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

    await clickUpdateButton(user);

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expectBookmarkFormValues({
        url: bookmarkToSelect.url,
        title: bookmarkToSelect.title,
        buttonName: UPDATE_BUTTON_ROLE_NAME,
      });
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

    await clickUpdateButton(user);

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expectBookmarkFormValues({
        url: bookmarkToSelect.url,
        title: bookmarkToSelect.title,
        buttonName: UPDATE_BUTTON_ROLE_NAME,
      });
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

    await clickUpdateButton(user);

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expectBookmarkFormValues({
        url: bookmarkToSelect.url,
        title: bookmarkToSelect.title,
        buttonName: UPDATE_BUTTON_ROLE_NAME,
      });
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

    await clickUpdateButton(user);

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expectBookmarkFormValues({
        url: bookmarkToSelect.url,
        title: bookmarkToSelect.title,
        buttonName: UPDATE_BUTTON_ROLE_NAME,
      });
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

    await clickUpdateButton(user);

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      expectBookmarkFormValues({
        url: bookmarkToSelect.url,
        title: bookmarkToSelect.title,
        buttonName: UPDATE_BUTTON_ROLE_NAME,
      });
    });
  });
});
