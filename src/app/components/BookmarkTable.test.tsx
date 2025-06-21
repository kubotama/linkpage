import "@testing-library/jest-dom";

import { describe, expect, it, vi } from "vitest";

import { render, screen, within } from "@testing-library/react";
import { mockBookmarks } from "../types/Bookmark";

import { SelectedBookmark } from "../types/Bookmark";
import { BookmarkTable } from "./BookmarkTable";

describe("BookmarkTableのテスト", () => {
  it("テーブルとヘッダーが正しく表示される", () => {
    const mockOnSelectBookmark: React.Dispatch<
      React.SetStateAction<SelectedBookmark>
    > = vi.fn();
    render(
      <BookmarkTable
        bookmarks={mockBookmarks}
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
    const mockOnSelectBookmark: React.Dispatch<
      React.SetStateAction<SelectedBookmark>
    > = vi.fn();
    render(
      <BookmarkTable
        bookmarks={mockBookmarks}
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
    const mockOnSelectBookmark: React.Dispatch<
      React.SetStateAction<SelectedBookmark>
    > = vi.fn();
    render(
      <BookmarkTable bookmarks={[]} onSelectBookmark={mockOnSelectBookmark} />
    );

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    const rows = screen.queryAllByRole("row");
    expect(rows).toHaveLength(0); // ヘッダー行のみ

    expect(mockOnSelectBookmark).not.toHaveBeenCalled();
  });
});
