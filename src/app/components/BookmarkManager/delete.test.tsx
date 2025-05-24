import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import { act } from "react";

import { render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockBookmarks: Bookmark[] = createBookmarkList([
  {
    url: "https://github.com/kubotama/linkpage",
    title: "kubotama/linkpage",
  },
  {
    url: "https://www.google.com/",
    title: "Google",
  },
  {
    url: "https://mail.google.com",
    title: "Gmail",
  },
  {
    url: "https://www.amazon.co.jp/",
    title: "Amazon",
  },
]);

describe("削除ボタン", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
  });

  it("ブックマークが選択されていない場合には削除ボタンは表示されない", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    const deleteButtons = screen.queryAllByRole("button", {
      name: "削除",
    });

    await waitFor(() => {
      expect(deleteButtons).toHaveLength(0);
    });
  });

  it("ブックマークが選択されると削除ボタンが表示される", () => {});

  it("ブックマークが削除される(APIの呼び出し、画面の更新)", () => {});

  it("存在しないブックマークの削除しようとした場合のエラーハンドリング(404)", () => {});

  it("不正なJSONデータの場合のエラーハンドリング(500)", () => {});

  it("IDがリクエストボディに含まれていない場合のエラーハンドリング(400)", () => {});
});
