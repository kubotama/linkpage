import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import { DELETE_BUTTON_ROLE_NAME } from "../../constants/constants";
import {
  clickBookmark,
  createMockResponse,
  mockBookmarks,
} from "../../test-utils/bookmarkTestUtils";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

describe("削除ボタン", () => {
  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
  });

  it("ブックマークが選択されていない場合には削除ボタンは表示されない", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    const deleteButtons = screen.queryAllByRole("button", {
      name: DELETE_BUTTON_ROLE_NAME,
    });

    await waitFor(() => {
      expect(deleteButtons).toHaveLength(0);
    });
  });

  it("ブックマークが選択されると削除ボタンが表示される", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    // テーブル内に既知のブックマークのタイトルが表示されることを確認
    // また、アクションボタンが表示されていることで、メインUIの準備ができていることを確認
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    await waitFor(() => {
      const deleteButton = screen.getByRole("button", {
        name: DELETE_BUTTON_ROLE_NAME,
      });
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it("ブックマークが削除される(APIの呼び出し、画面の更新)", async () => {
    // fetchMockはbeforeEachでmockBookmarksを返すように設定されています

    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    // テーブル内に既知のブックマークのタイトルが表示されることを確認
    // また、アクションボタンが表示されていることで、メインUIの準備ができていることを確認
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    // fetchMock.resetMocks();
    // fetchMock.mockResponseOnce("", { status: 204 });
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce(createMockResponse({ isOk: true, status: 204 }));

    const deleteButton = screen.getByRole("button", {
      name: DELETE_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

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
    // fetchMockはbeforeEachでmockBookmarksを返すように設定されています

    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    // テーブル内に既知のブックマークのタイトルが表示されることを確認
    // また、アクションボタンが表示されていることで、メインUIの準備ができていることを確認
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        message: "指定されたブックマークがありません。",
        isOk: false,
        status: 404,
      })
    );

    const deleteButton = screen.getByRole("button", {
      name: DELETE_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

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
    // fetchMockはbeforeEachでmockBookmarksを返すように設定されています

    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    // テーブル内に既知のブックマークのタイトルが表示されることを確認
    // また、アクションボタンが表示されていることで、メインUIの準備ができていることを確認
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        message: "リクエストにIDがありませんでした。",
        isOk: false,
        status: 400,
      })
    );

    const deleteButton = screen.getByRole("button", {
      name: DELETE_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

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
    // fetchMockはbeforeEachでmockBookmarksを返すように設定されています

    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    // テーブル内に既知のブックマークのタイトルが表示されることを確認
    // また、アクションボタンが表示されていることで、メインUIの準備ができていることを確認
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });

    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        message: "サーバーで予期せぬエラーが発生しました。",
        isOk: false,
        status: 500,
      })
    );

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const deleteButton = screen.getByRole("button", {
      name: DELETE_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

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
