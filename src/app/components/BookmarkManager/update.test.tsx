import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { screen, waitFor, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import { TABLE_NAME_BOOKMARKS, UPDATE_BUTTON_ROLE_NAME } from "../../constants/constants";
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

    // TODO: #272で対応する
    await waitFor(() => {
      expect(updateButtons).toHaveLength(0);
    });
  });

  describe("ブックマークが選択されている場合", () => {
    let bookmarkToSelect: Bookmark;
    beforeEach(async () => {
      // 2番目のブックマーク「Google」を選択
      bookmarkToSelect = mockBookmarks[1];
      await clickBookmark(user, bookmarkToSelect);
      mockFetch.mockReset();
    });

    it("ブックマークが選択されている場合には、タイトルの更新ボタンが表示される。", async () => {
      await screen.findByRole("button", { name: UPDATE_BUTTON_ROLE_NAME });
    });

    it("ブックマークのタイトルが更新される。(APIの呼び出し、画面の更新)", async () => {
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
        expect(mockFetch).toHaveBeenCalledTimes(1);
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

        // 画面の更新の確認;
        // TODO: #273 - フォームの状態が非同期で更新されることを考慮したアサーションに変更
        expectBookmarkFormValues({ url: updateUrl, title: updateTitle });
      });
      expect(await screen.findAllByText(updateTitle)).toHaveLength(1);

      const updatedBookmark: Bookmark = createBookmark({
        bookmark_id: bookmarkToSelect.bookmark_id,
        url: updateUrl,
        title: updateTitle,
        keywords: bookmarkToSelect.keywords,
      });
      await clickBookmark(user, updatedBookmark);
      await waitFor(() => {
        // TODO: #273 - フォームの状態が非同期で更新されることを考慮したアサーションに変更
        expectBookmarkFormValues({ url: updateUrl, title: updateTitle });
      });
    });

    it("同じURLを指定された場合には409を返す。", async () => {
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
        // TODO: #273 - フォームの状態が非同期で更新されることを考慮したアサーションに変更
        // フォームに入力した値が保持され、更新ボタンが表示されていることを確認
        expectBookmarkFormValues({
          url: updateUrl,
          title: updateTitle,
          buttonName: UPDATE_BUTTON_ROLE_NAME,
        });
      });
      expect(await screen.findByTestId("bookmark-message")).toHaveTextContent(
        "指定されたURLのブックマークは既に登録されています。"
      );
      const table = await screen.findByRole("table", { name: TABLE_NAME_BOOKMARKS });
      await within(table).findByText(bookmarkToSelect.title);
    });

    it("タイトルが空の状態で更新しようとすると、エラーメッセージが表示される", async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          isOk: false,
          status: 400,
          message: "タイトルが指定されていません。",
        })
      );

      await setBookmarkFormValuesAndClickButton(user, { title: "" }, UPDATE_BUTTON_ROLE_NAME);

      await waitFor(() => {
        // TODO: #273 - フォームの状態が非同期で更新されることを考慮したアサーションに変更
        // フォームにはユーザーが入力した空のタイトルが保持されるべき
        expectBookmarkFormValues({
          url: bookmarkToSelect.url,
          title: "",
          buttonName: UPDATE_BUTTON_ROLE_NAME,
        });
      });
      expect(await screen.findByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
    });

    it.each([
      {
        description: "存在しないブックマーク (404 Not Found)",
        errorCase: { message: "指定されたブックマークがありません。", status: 404 },
      },
      {
        description: "不正なリクエスト (400 Bad Request)",
        errorCase: { message: "リクエストにIDがありませんでした。", status: 400 },
      },
      {
        description: "IDの形式が不正 (400 Bad Request)",
        errorCase: {
          message: "IDは正の整数である必要があります。",
          status: 400,
        },
      },
      {
        description: "不正なJSONデータ (500 Internal Server Error)",
        errorCase: { message: "サーバーで予期せぬエラーが発生しました。", status: 500 },
      },
    ])("エラーハンドリング: $description", async ({ errorCase }) => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ ...errorCase, isOk: false }));

      await clickUpdateButton(user);

      await waitFor(() => {
        // TODO: #273 - フォームの状態が非同期で更新されることを考慮したアサーションに変更
        expectBookmarkFormValues({
          url: bookmarkToSelect.url,
          title: bookmarkToSelect.title,
          buttonName: UPDATE_BUTTON_ROLE_NAME,
        });
      });
      expect(await screen.findByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
    });
  });
});
