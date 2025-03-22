import "@testing-library/jest-dom";

import React from "react";

import { render, screen, within } from "@testing-library/react";

import { BmGrid } from "./bmGrid";
import { Bookmark } from "./BookmarkManager";

const mockBookmarks: Bookmark[] = [
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
];

describe("BmGrid", () => {
  it("テーブルとヘッダーが正しく表示される", () => {
    render(<BmGrid bookmarks={mockBookmarks} />);

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    const headers = within(table).getAllByRole("columnheader");
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveTextContent("Title");
  });

  it("ブックマークデータが正しく表示される", () => {
    render(<BmGrid bookmarks={mockBookmarks} />);

    const rows = screen.getAllByRole("row");
    // ヘッダー行を含むため、mockBookmarks.length + 1
    expect(rows).toHaveLength(mockBookmarks.length + 1);

    mockBookmarks.forEach((bookmark, index) => {
      const cells = within(rows[index + 1]).getAllByRole("cell");
      const link = within(cells[0]).getByRole("link");

      expect(link).toHaveAttribute("href", bookmark.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveTextContent(bookmark.title);
      // expect(cells[1]).toHaveTextContent(bookmark.url);
    });
  });

  it("空のブックマークリストでテーブルが表示される", () => {
    render(<BmGrid bookmarks={[]} />);

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(1); // ヘッダー行のみ
  });
});
