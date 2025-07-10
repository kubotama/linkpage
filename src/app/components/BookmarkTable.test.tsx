import "@testing-library/jest-dom";

import { describe, expect, it, vi } from "vitest";

import { render, screen, within } from "@testing-library/react";
import { mockBookmarks, SelectedBookmark } from "../types/Bookmark";

import { BookmarkTable } from "./BookmarkTable";

describe("BookmarkTableのテスト", () => {
  it("テーブルとヘッダーが正しく表示される", () => {
    const mockOnSelectBookmark: React.Dispatch<SelectedBookmark> = vi.fn();
    render(
      <BookmarkTable
        bookmarks={mockBookmarks}
        selectedBookmark={undefined}
        onSelectBookmark={mockOnSelectBookmark}
      />
    );

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    const headers = within(table).getAllByRole("columnheader");
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveTextContent("タイトル");

    expect(mockOnSelectBookmark).not.toHaveBeenCalled();
  });

  it("ブックマークデータが正しく表示される", () => {
    const mockOnSelectBookmark: React.Dispatch<SelectedBookmark> = vi.fn();
    render(
      <BookmarkTable
        bookmarks={mockBookmarks}
        selectedBookmark={undefined}
        onSelectBookmark={mockOnSelectBookmark}
      />
    );

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(mockBookmarks.length);

    mockBookmarks.forEach((bookmark, index) => {
      const cells = within(rows[index]).getAllByRole("cell");
      expect(cells).toHaveLength(1);
      expect(cells[0]).toHaveTextContent(bookmark.title);
    });
    expect(mockOnSelectBookmark).not.toHaveBeenCalled();
  });

  it("空のブックマークリストでテーブルが表示される", () => {
    const mockOnSelectBookmark: React.Dispatch<SelectedBookmark> = vi.fn();
    render(
      <BookmarkTable
        bookmarks={[]}
        selectedBookmark={undefined}
        onSelectBookmark={mockOnSelectBookmark}
      />
    );

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    const rows = screen.queryAllByRole("row");
    expect(rows).toHaveLength(0); // ヘッダー行のみ

    expect(mockOnSelectBookmark).not.toHaveBeenCalled();
  });

  it("選択されたブックマークが正しくハイライト表示される", () => {
    const mockOnSelectBookmark = vi.fn();
    const selected = mockBookmarks[1]; // "Google" を選択状態にする

    render(
      <BookmarkTable
        bookmarks={mockBookmarks}
        selectedBookmark={selected}
        onSelectBookmark={mockOnSelectBookmark}
      />
    );

    // 選択された行のセルを取得
    const selectedCell = screen.getByText(selected.title);
    // 選択されていない行のセルを取得
    const unselectedCell = screen.getByText(mockBookmarks[0].title);

    expect(selectedCell).toHaveClass("bg-sky-500", "text-gray-100");
    expect(selectedCell).not.toHaveClass("text-gray-900");

    // 選択されていない行が通常のクラスを持つことを確認
    expect(unselectedCell).toHaveClass("bg-gray-100", "text-gray-900");
    expect(unselectedCell).not.toHaveClass("text-gray-100");
  });
});
