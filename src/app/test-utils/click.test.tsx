import { act } from "react";
import { Bookmark } from "../types/Bookmark";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect } from "vitest";

export const clickBookmark = async (bookmark: Bookmark) => {
  // クリックするブックマークを選択（例：2番目のブックマーク）
  // const bookmark = mockBookmarks[1]; // Google
  try {
    const cellWithTitle = screen.getByText(bookmark.title);

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(cellWithTitle);
    });

    // await waitFor(() => {
    //   const urlInput = screen.getByRole("textbox", { name: "url" });
    //   const titleInput = screen.getByRole("textbox", { name: "title" });
    //   expect(urlInput).toHaveValue(bookmark.url);
    //   expect(titleInput).toHaveValue(bookmark.title);
    // });
  } catch (error) {
    // エラーメッセージに元のエラーを含めるとデバッグが容易になります
    console.error(error); // 元のエラーをログに出力
    throw new Error(
      `ブックマーク "${bookmark.title}" のテーブル行のクリック処理中にエラーが発生しました。`
    );
  }
};
