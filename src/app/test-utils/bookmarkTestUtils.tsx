import { act } from "react";
import { expect } from "vitest";

import { fireEvent, screen, waitFor } from "@testing-library/react";

import { TITLE_ROLE_NAME, URL_ROLE_NAME } from "../constants/constants";
import { Bookmark } from "../types/Bookmark";
import { FORM_BOOKMARK_DETAIL } from "../constants/constants";

export const assertBookmarkIsSelected = async (bookmark: Bookmark) => {
  await waitFor(() => {
    expect(screen.getByRole("textbox", { name: URL_ROLE_NAME })).toHaveValue(
      bookmark.url
    );
    expect(screen.getByRole("textbox", { name: TITLE_ROLE_NAME })).toHaveValue(
      bookmark.title
    );
  });
};

export const assertNoBookmarkIsSelected = async () => {
  await waitFor(() => {
    expect(
      screen.queryByRole("form", { name: FORM_BOOKMARK_DETAIL })
    ).not.toBeInTheDocument();
  });
};

export const clickBookmark = async (bookmark: Bookmark) => {
  // クリックするブックマークを選択（例：2番目のブックマーク）
  // const bookmark = mockBookmarks[1]; // Google
  try {
    const cellWithTitle = screen.getByText(bookmark.title);

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(cellWithTitle);
    });
    await assertBookmarkIsSelected(bookmark);
  } catch (error) {
    // エラーメッセージに元のエラーを含めるとデバッグが容易になります
    console.error(error); // 元のエラーをログに出力
    throw new Error(
      `ブックマーク "${bookmark.title}" のテーブル行のクリック処理中にエラーが発生しました。`
    );
  }
};
