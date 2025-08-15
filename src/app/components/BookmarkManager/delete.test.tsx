import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { Bookmark } from "../../types/Bookmark";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import { DELETE_BUTTON_ROLE_NAME } from "../../constants/constants";
import {
  clickBookmark,
  createMockResponse,
  mockBookmarks,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";

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

  it("ブックマークが選択されていない場合には削除ボタンは表示されない", async () => {
    const deleteButtons = screen.queryAllByRole("button", {
      name: DELETE_BUTTON_ROLE_NAME,
    });

    await waitFor(() => {
      expect(deleteButtons).toHaveLength(0);
    });
  });

  describe("ブックマークが選択されている場合", () => {
    let bookmarkToSelect: Bookmark;

    beforeEach(async () => {
      // クリックするブックマークを選択（例：2番目のブックマーク
      bookmarkToSelect = mockBookmarks[1]; // Google
      await clickBookmark(user, bookmarkToSelect);
    });

    it("ブックマークが選択されると削除ボタンが表示される", async () => {
      await waitFor(() => {
        const deleteButton = screen.getByRole("button", {
          name: DELETE_BUTTON_ROLE_NAME,
        });
        expect(deleteButton).toBeInTheDocument();
      });
    });

    it("ブックマークが削除される(APIの呼び出し、画面の更新)", async () => {
      mockFetch.mockReset();
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

    it("存在しないブックマークの削除しようとした場合のエラーハンドリング(404)", async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          message: "指定されたブックマークがありません。",
          isOk: false,
          status: 404,
        })
      );

      await clickDeleteButton(user);

      await waitFor(() => {
        // 画面の更新の確認
        expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
          "ブックマークの削除中にエラーが発生しました。"
        );
        // 削除操作のコンテキスト（選択されたブックマークのタイトルや削除ボタン）が依然として表示されていることを確認
        expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: DELETE_BUTTON_ROLE_NAME })).toBeInTheDocument();
      });
    });

    it("IDがリクエストボディに含まれていない場合のエラーハンドリング(400)", async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          message: "リクエストにIDがありませんでした。",
          isOk: false,
          status: 400,
        })
      );

      await clickDeleteButton(user);

      await waitFor(() => {
        // 画面の更新の確認
        expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
          "ブックマークの削除中にエラーが発生しました。"
        );
        // 削除操作のコンテキスト（選択されたブックマークのタイトルや削除ボタン）が依然として表示されていることを確認
        expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: DELETE_BUTTON_ROLE_NAME })).toBeInTheDocument();
      });
    });

    it("不正なJSONデータの場合のエラーハンドリング(500)", async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          message: "サーバーで予期せぬエラーが発生しました。",
          isOk: false,
          status: 500,
        })
      );

      await clickDeleteButton(user);

      await waitFor(() => {
        // 画面の更新の確認
        expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
          "ブックマークの削除中にエラーが発生しました。"
        );
        // 削除操作のコンテキスト（選択されたブックマークのタイトルや削除ボタン）が依然として表示されていることを確認
        expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: DELETE_BUTTON_ROLE_NAME })).toBeInTheDocument();
      });
    });
  });
});
