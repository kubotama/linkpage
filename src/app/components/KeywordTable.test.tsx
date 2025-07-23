import "@testing-library/jest-dom";

import { describe, expect, it } from "vitest";

import { render, screen, within } from "@testing-library/react";

import { buildMockBookmarksWithKeywords } from "../test-utils/bookmarkTestUtils";
import { KeywordTable } from "./KeywordTable";

describe("KeywordTableのテスト", () => {
  it("キーワードのリストが空の場合、ヘッダー行のみ表示されデータ行は表示されない", () => {
    render(<KeywordTable keywords={[]} />);
    const keywordTable = screen.getByRole("table", { name: "キーワードのテーブル" });
    expect(keywordTable).toBeInTheDocument();

    const rows = screen.queryAllByRole("row");
    expect(rows).toHaveLength(1); // ヘッダー行のみ

    const cells = screen.queryAllByRole("cell");
    expect(cells).toHaveLength(0); // データセルは存在しない
  });

  it("キーワードのリストが渡された場合、すべてのキーワードが正しく表示される", () => {
    const allBookmarks = buildMockBookmarksWithKeywords();
    const googleBookmark = allBookmarks.find((b) => b.title === "Google");

    // テストデータに 'Google' が存在することを確認
    if (!googleBookmark) {
      throw new Error("Mock data is missing the 'Google' bookmark.");
    }

    const keywords = googleBookmark.keywords;
    expect(keywords.length).toBeGreaterThan(0); // Ensure test data is valid

    render(<KeywordTable keywords={keywords} />);
    // `getAllByRole` is used here as we expect rows to be present.
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(keywords.length + 1);

    keywords.forEach((keyword, index) => {
      const row = rows[index + 1];
      const cell = within(row).getByRole("cell");
      expect(cell).toHaveTextContent(keyword.keyword_name);
    });
  });
});
