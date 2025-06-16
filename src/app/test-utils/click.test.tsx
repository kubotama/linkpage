import { act } from "react";
import { Bookmark } from "../types/Bookmark";
import { fireEvent, screen } from "@testing-library/react";

export const clickBookmark = async (bookmark: Bookmark) => {
  // クリックするブックマークを選択（例：2番目のブックマーク）
  // const bookmark = mockBookmarks[1]; // Google

  // 選択したブックマークに対応するテーブル行を見つける
  // 行にはブックマークのタイトルを持つリンクが含まれている
  try {
    const bookmarkLinkInRow = screen.getByRole("link", {
      name: bookmark.title,
    });
    const tableRow = bookmarkLinkInRow.closest("tr");
    if (!tableRow) {
      throw new Error(
        `ブックマーク "${bookmark.title}" のテーブル行が見つかりませんでした。`
      );
    }
    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(tableRow);
    });
  } catch {
    throw new Error(
      `ブックマーク "${bookmark.title}" のテーブル行が見つかりませんでした。`
    );
  }
};
