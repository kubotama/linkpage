import "@testing-library/jest-dom";

import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { screen, waitFor, within } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import { TABLE_NAME_BOOKMARKS, UPDATE_BUTTON_ROLE_NAME } from "../../constants/constants";
import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_NOT_FOUND,
} from "../../constants/httpStatusCodes";
import {
  assertBookmarkIsSelected,
  assertErrorMessage,
  clickBookmark,
  clickButtonByName,
  createBookmark,
  createMockResponse,
  expectBookmarkFormValues,
  GMAIL_BOOKMARK,
  GOOGLE_BOOKMARK,
  setBookmarkFormValuesAndClickButton,
  setupBookmarkManagerForTest,
  testApiErrorHandling,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();

describe("タイトルの更新ボタン", () => {
  let user: UserEvent;

  beforeEach(async () => {
    global.fetch = mockFetch;

    user = await setupBookmarkManagerForTest({ fetchForSetup: mockFetch });
  });

  it("ブックマークが選択されていない場合には、タイトルの更新ボタンは表示されない。", () => {
    expect(screen.queryByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).not.toBeInTheDocument();
  });

  describe("ブックマークが選択されている場合", () => {
    let bookmarkToSelect: Bookmark;
    beforeEach(async () => {
      // 2番目のブックマーク「Google」を選択
      bookmarkToSelect = GOOGLE_BOOKMARK;
      await clickBookmark(user, bookmarkToSelect);
      await assertBookmarkIsSelected(bookmarkToSelect);
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
          status: HTTP_STATUS_NO_CONTENT,
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
      });
      expect(await screen.findAllByText(updateTitle)).toHaveLength(1);

      // 画面の更新の確認;
      await expectBookmarkFormValues({ url: updateUrl, title: updateTitle });

      const updatedBookmark: Bookmark = createBookmark({
        bookmark_id: bookmarkToSelect.bookmark_id,
        url: updateUrl,
        title: updateTitle,
        keywords: bookmarkToSelect.keywords,
      });
      await clickBookmark(user, updatedBookmark);
      await assertBookmarkIsSelected(updatedBookmark);
      await expectBookmarkFormValues({ url: updateUrl, title: updateTitle });
    });

    describe("エラーメッセージが出力される場合", () => {
      let consoleErrorSpy: MockInstance;

      beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      });

      afterEach(() => {
        consoleErrorSpy.mockRestore();
      });

      it("同じURLを指定された場合には409を返す。", async () => {
        const updateUrl = GMAIL_BOOKMARK.url;
        const updateTitle = "更新されたタイトル";
        await testApiErrorHandling({
          action: () =>
            setBookmarkFormValuesAndClickButton(
              user,
              { url: updateUrl, title: updateTitle },
              UPDATE_BUTTON_ROLE_NAME
            ),
          errorCase: {
            message: "指定されたURLのブックマークは既に登録されています。",
            status: HTTP_STATUS_CONFLICT,
          },
          mockFetch,
          consoleErrorSpy,
          errorMessage: "ブックマークの更新エラー:",
        });

        // フォームに入力した値が保持され、更新ボタンが表示されていることを確認
        await expectBookmarkFormValues({
          url: updateUrl,
          title: updateTitle,
          buttonName: UPDATE_BUTTON_ROLE_NAME,
        });

        const table = await screen.findByRole("table", { name: TABLE_NAME_BOOKMARKS });
        await within(table).findByText(bookmarkToSelect.title);
      });

      it.each([
        {
          description: "存在しないブックマーク (404 Not Found)",
          errorCase: {
            message: "指定されたブックマークがありません。",
            status: HTTP_STATUS_NOT_FOUND,
          },
        },
        {
          description: "不正なリクエスト (400 Bad Request)",
          errorCase: {
            message: "リクエストにIDがありませんでした。",
            status: HTTP_STATUS_BAD_REQUEST,
          },
        },
        {
          description: "IDの形式が不正 (400 Bad Request)",
          errorCase: {
            message: "IDは正の整数である必要があります。",
            status: HTTP_STATUS_BAD_REQUEST,
          },
        },
        {
          description: "不正なJSONデータ (500 Internal Server Error)",
          errorCase: {
            message: "サーバーで予期せぬエラーが発生しました。",
            status: HTTP_STATUS_INTERNAL_SERVER_ERROR,
          },
        },
      ])("エラーハンドリング: $description", async ({ errorCase }) => {
        await testApiErrorHandling({
          action: () => clickButtonByName(user, UPDATE_BUTTON_ROLE_NAME),
          errorCase,
          mockFetch,
          consoleErrorSpy,
          errorMessage: "ブックマークの更新エラー:",
        });

        // フォームの値は変更されずに保持されるべき
        await expectBookmarkFormValues({
          url: bookmarkToSelect.url,
          title: bookmarkToSelect.title,
          buttonName: UPDATE_BUTTON_ROLE_NAME,
        });
      });

      it.each([
        {
          description: "不正なリクエスト (400 Bad Request)",
          value: { url: "http://example.com", title: "" },
          message: "タイトルが指定されていません。",
        },
        {
          description: "不正なリクエスト (400 Bad Request)",
          value: { url: "", title: "テストタイトル" },
          message: "URLが指定されていません。",
        },
      ])("入力値が不正な場合のエラーハンドリング: $description", async ({ value, message }) => {
        await setBookmarkFormValuesAndClickButton(user, value, UPDATE_BUTTON_ROLE_NAME);

        expect(mockFetch).toBeCalledTimes(0);

        expect(consoleErrorSpy).toHaveBeenCalledWith("ブックマークの更新エラー:", `${message}`);

        // フォームの値は変更されずに保持されるべき
        await expectBookmarkFormValues({
          url: value.url,
          title: value.title,
          buttonName: UPDATE_BUTTON_ROLE_NAME,
        });

        await assertErrorMessage({
          message: message,
          isError: true,
          isAsync: true,
        });
      });
    });
  });
});
