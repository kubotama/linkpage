import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, within } from "@testing-library/react";

import {
  BASE_CELL_STYLE,
  ROW_STYLE_BOOKMARK_SELECTED,
  ROW_STYLE_KEYWORD_SELECTED,
  TABLE_NAME_BOOKMARKS,
} from "../constants/constants";
import {
  buildMockBookmarksWithKeywords,
  GOOGLE_BOOKMARK,
  mockBookmarks,
} from "../test-utils/bookmarkTestUtils";
import { hasKeyword } from "../types/Bookmark";
import { BookmarkTable } from "./BookmarkTable";

describe("BookmarkTableのテスト", () => {
  let mockOnSelectBookmark = vi.fn<(bookmarkId: number) => void>();

  beforeEach(() => {
    mockOnSelectBookmark = vi.fn();
  });

  const renderComponent = (props = {}, customBookmarks = mockBookmarks) => {
    render(
      <BookmarkTable
        bookmarks={customBookmarks}
        selectedBookmarkId={undefined}
        onSelectBookmarkId={mockOnSelectBookmark}
        selectedKeywordId={undefined}
        {...props}
      />
    );
  };

  it("テーブルとヘッダーが正しく表示される", () => {
    renderComponent();

    const table = screen.getByRole("table", { name: TABLE_NAME_BOOKMARKS });
    expect(table).toBeVisible();

    const headers = within(table).getAllByRole("columnheader");
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveTextContent("タイトル");

    expect(mockOnSelectBookmark).not.toHaveBeenCalled();
  });

  it("ブックマークデータが正しく表示される", () => {
    renderComponent();

    // theadとtbodyはrowgroupロールを持つため、screen.getAllByRoleで取得する
    const [thead, tbody] = screen.getAllByRole("rowgroup");

    const headerRows = within(thead).getAllByRole("row");
    expect(headerRows).toHaveLength(1);
    const headerCells = within(headerRows[0]).getAllByRole("columnheader");
    expect(headerCells).toHaveLength(1);
    expect(headerCells[0]).toHaveTextContent("タイトル");

    const bodyRows = within(tbody).getAllByRole("row");
    expect(bodyRows).toHaveLength(mockBookmarks.length);

    mockBookmarks.forEach((bookmark, index) => {
      const cells = within(bodyRows[index]).getAllByRole("cell");
      expect(cells).toHaveLength(1);
      expect(cells[0]).toHaveTextContent(bookmark.title);
    });
    expect(mockOnSelectBookmark).not.toHaveBeenCalled();
  });

  it("空のブックマークリストでテーブルが表示される", () => {
    renderComponent({ bookmarks: [] });

    const table = screen.getByRole("table");
    expect(table).toBeVisible();

    const rows = screen.queryAllByRole("row");
    expect(rows).toHaveLength(1); // ヘッダー行のみ

    expect(mockOnSelectBookmark).not.toHaveBeenCalled();
  });

  it("選択されたブックマークが正しくハイライト表示される", () => {
    const selected = GOOGLE_BOOKMARK; // "Google" を選択状態にする

    renderComponent({
      selectedBookmarkId: selected.bookmark_id,
    });
    // 選択された行のセルを取得
    const selectedCell = screen.getByRole("cell", { name: selected.title });
    // 選択された行がハイライトクラスを持つことを確認
    expect(selectedCell).toHaveClass(ROW_STYLE_BOOKMARK_SELECTED);

    // 選択されていない行のセルを取得
    const unselectedBookmark = mockBookmarks.find((b) => b.bookmark_id !== selected.bookmark_id);
    if (!unselectedBookmark) {
      throw new Error("選択されていないブックマークが見つかるべきです");
    }
    const unselectedCell = screen.getByRole("cell", {
      name: unselectedBookmark.title,
    });
    // 選択されていない行が通常のクラスを持つことを確認
    expect(unselectedCell).toHaveClass(BASE_CELL_STYLE);
    expect(unselectedCell).not.toHaveClass(ROW_STYLE_BOOKMARK_SELECTED);
  });

  it("選択されたキーワードを持つブックマークが正しくハイライト表示される", () => {
    const mockBookmarksWithKeywords = buildMockBookmarksWithKeywords();
    const selectedKeywordId = 1; // "キーワード1"

    renderComponent(
      {
        selectedKeywordId: selectedKeywordId,
      },
      mockBookmarksWithKeywords
    );

    mockBookmarksWithKeywords.forEach((bookmark) => {
      const cell = screen.getByRole("cell", { name: bookmark.title });
      if (hasKeyword(bookmark, selectedKeywordId)) {
        // キーワードを持つブックマークはハイライトされる
        expect(cell).toHaveClass(ROW_STYLE_KEYWORD_SELECTED);
        expect(cell).not.toHaveClass(ROW_STYLE_BOOKMARK_SELECTED);
      } else {
        // キーワードを持たないブックマークはハイライトされない
        expect(cell).not.toHaveClass(ROW_STYLE_KEYWORD_SELECTED);
        expect(cell).not.toHaveClass(ROW_STYLE_BOOKMARK_SELECTED);
      }
    });
  });

  it("ブックマークとキーワードが両方選択された場合に正しくハイライト表示される", () => {
    const mockBookmarksWithKeywords = buildMockBookmarksWithKeywords();
    const selectedKeywordId = 1; // "キーワード1"
    const bookmarkToSelect = mockBookmarksWithKeywords.find((b) =>
      hasKeyword(b, selectedKeywordId)
    );
    if (!bookmarkToSelect) {
      throw new Error("テストデータエラー: キーワードID 1 を持つブックマークが見つかりません。");
    }
    const selectedBookmarkId = bookmarkToSelect.bookmark_id;

    renderComponent(
      {
        selectedKeywordId: selectedKeywordId,
        selectedBookmarkId: selectedBookmarkId,
      },
      mockBookmarksWithKeywords
    );

    mockBookmarksWithKeywords.forEach((bookmark) => {
      const cell = screen.getByRole("cell", { name: bookmark.title });
      const isBookmarkSelected = bookmark.bookmark_id === selectedBookmarkId;
      const hasKeywordSelected = hasKeyword(bookmark, selectedKeywordId);

      if (isBookmarkSelected) {
        expect(cell).toHaveClass(ROW_STYLE_BOOKMARK_SELECTED);
      } else {
        expect(cell).not.toHaveClass(ROW_STYLE_BOOKMARK_SELECTED);
      }

      if (hasKeywordSelected) {
        expect(cell).toHaveClass(ROW_STYLE_KEYWORD_SELECTED);
      } else {
        expect(cell).not.toHaveClass(ROW_STYLE_KEYWORD_SELECTED);
      }
    });
  });
});
