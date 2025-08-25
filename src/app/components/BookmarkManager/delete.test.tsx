import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import { DELETE_BUTTON_ROLE_NAME } from "../../constants/constants";
import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_OK,
} from "../../constants/httpStatusCodes";
import {
  assertBookmarkIsSelected,
  assertErrorMessage,
  clickBookmark,
  clickButtonByName,
  createMockResponse,
  GOOGLE_BOOKMARK,
  mockBookmarks,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();

describe("削除ボタン", () => {
  let user: UserEvent;

  beforeEach(async () => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: HTTP_STATUS_OK,
      json: async () => mockBookmarks,
    });

    user = userEvent.setup();

    await setupBookmarkManagerForTest();
  });

  it("ブックマークが選択されていない場合には削除ボタンは表示されない", () => {
    expect(screen.queryByRole("button", { name: DELETE_BUTTON_ROLE_NAME })).not.toBeInTheDocument();
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

    it("ブックマークが選択されると削除ボタンが表示される", async () => {
      await screen.findByRole("button", { name: DELETE_BUTTON_ROLE_NAME });
    });

    it("ブックマークが削除される(APIの呼び出し、画面の更新)", async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ isOk: true, status: HTTP_STATUS_NO_CONTENT })
      );

      await clickButtonByName(user, DELETE_BUTTON_ROLE_NAME);

      await waitFor(() => {
        // APIの呼び出しの確認
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch.mock.calls[0][0]).toEqual(
          `${BOOKMARKS_ENDPOINT}/${bookmarkToSelect.bookmark_id}`
        );
        expect(mockFetch.mock.calls[0][1]).toEqual({
          method: "DELETE",
        });

        // 画面の更新の確認
        expect(screen.queryByText(bookmarkToSelect.title)).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: DELETE_BUTTON_ROLE_NAME })
        ).not.toBeInTheDocument();
      });
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
        description: "サーバーエラー (500 Internal Server Error)",
        errorCase: {
          message: "サーバーで予期せぬエラーが発生しました。",
          status: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        },
      },
    ])("エラーハンドリング: $description", async ({ errorCase }) => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      try {
        mockFetch.mockResolvedValueOnce(createMockResponse({ ...errorCase, isOk: false }));
        await clickButtonByName(user, DELETE_BUTTON_ROLE_NAME);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "ブックマークの削除エラー:",
          `ApiError: [${errorCase.status}] ${errorCase.message}`
        );

        await assertErrorMessage({
          message: "ブックマークの削除中にエラーが発生しました。",
          isError: true,
          isAsync: true,
        });

        await screen.findByText(bookmarkToSelect.title);
        await screen.findByRole("button", { name: DELETE_BUTTON_ROLE_NAME });
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });
});
