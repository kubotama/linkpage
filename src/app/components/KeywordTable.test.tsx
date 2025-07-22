import "@testing-library/jest-dom";

import { describe, expect, it } from "vitest";

import { cleanup, render, screen, within } from "@testing-library/react";

import { buildMockBookmarksWithKeywords } from "../test-utils/bookmarkTestUtils";
import { KeywordTable } from "./KeywordTable";

describe("KeywordTableのテスト", () => {
  it("キーワードのリストが空の場合でもテーブルは表示されるが、行は表示されない", () => {
    render(<KeywordTable keywords={[]} />);
    const keywordTable = screen.getByRole("table", { name: "キーワードのテーブル" });
    expect(keywordTable).toBeInTheDocument();

    const rows = screen.queryAllByRole("row");
    expect(rows).toHaveLength(0);
  });

  it("キーワードのリストが渡された場合、すべてのキーワードが正しく表示される", () => {
    const bookmarksWithKeywords = buildMockBookmarksWithKeywords();

    bookmarksWithKeywords.forEach((bookmark) => {
      const keywords = bookmark.keywords;

      render(<KeywordTable keywords={keywords} />);

      const rows = screen.queryAllByRole("row");
      expect(rows).toHaveLength(keywords.length);

      keywords.forEach((keyword, index) => {
        const row = rows[index];
        const cell = within(row).getByRole("cell");
        expect(cell).toHaveTextContent(keyword.keyword_name);
      });
      cleanup();
    });
  });
});
