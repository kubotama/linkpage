import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import { act } from "react";

import { render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const labelButton = "タイトルの更新";

const mockBookmarks: Bookmark[] = createBookmarkList([
  {
    id: 1,
    url: "https://github.com/kubotama/linkpage",
    title: "kubotama/linkpage",
  },
  {
    id: 2,
    url: "https://www.google.com/",
    title: "Google",
  },
  {
    id: 3,
    url: "https://mail.google.com",
    title: "Gmail",
  },
  {
    id: 4,
    url: "https://www.amazon.co.jp/",
    title: "Amazon",
  },
]);

describe("タイトルの更新ボタン", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
  });

  it("ブックマークが選択されていない場合には、タイトルの更新ボタンは表示されない。", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    const updateButtons = screen.queryAllByRole("button", {
      name: labelButton,
    });

    await waitFor(() => {
      expect(updateButtons).toHaveLength(0);
    });
  });

  it("ブックマークが選択されている場合には、タイトルの更新ボタンが表示される。", async () => {});

  it("ブックマークのタイトルが更新される。(APIの呼び出し、画面の更新)", async () => {});

  it("登録されていないブックマークIDを指定された場合は400を返す。", async () => {});

  it("タイトルが指定されていない場合には400を返す。", async () => {});

  it("IDが指定されていない場合には400を返す。", async () => {});

  it("不正な形式(文字列)のIDを指定された場合には400を返す。", async () => {});

  it("不正なJSONデータの場合は500を返す。", async () => {});
});
