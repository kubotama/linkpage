import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import { DELETE_BUTTON_ROLE_NAME } from "../../constants/constants";
import {
  clickBookmark,
  createMockResponse,
  mockBookmarks,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();

const clickDeleteButton = async (user: UserEvent) => {
  const deleteButton = screen.getByRole("button", {
    name: DELETE_BUTTON_ROLE_NAME,
  });

  await user.click(deleteButton);
};

describe("削除ボタン", () => {
  let user: UserEvent;

  beforeEach(async () => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
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
      bookmarkToSelect = mockBookmarks[1];
      await clickBookmark(user, bookmarkToSelect);

      mockFetch.mockReset();
    });

    it("ブックマークが選択されると削除ボタンが表示される", async () => {
      await screen.findByRole("button", { name: DELETE_BUTTON_ROLE_NAME });
    });

    it("ブックマークが削除される(APIの呼び出し、画面の更新)", async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ isOk: true, status: 204 }));

      await clickDeleteButton(user);

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
        errorCase: { message: "指定されたブックマークがありません。", status: 404 },
      },
      {
        description: "不正なリクエスト (400 Bad Request)",
        errorCase: { message: "リクエストにIDがありませんでした。", status: 400 },
      },
      {
        description: "サーバーエラー (500 Internal Server Error)",
        errorCase: { message: "サーバーで予期せぬエラーが発生しました。", status: 500 },
      },
    ])("エラーハンドリング: $description", async ({ errorCase }) => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ ...errorCase, isOk: false }));
      await clickDeleteButton(user);

      expect(await screen.findByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの削除中にエラーが発生しました。"
      );
      await screen.findByText(bookmarkToSelect.title);
      await screen.findByRole("button", { name: DELETE_BUTTON_ROLE_NAME });
    });
  });
});
