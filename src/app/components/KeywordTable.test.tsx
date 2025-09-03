import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { ROW_STYLE_KEYWORD_SELECTED } from "../constants/constants";
import {
  buildMockBookmarksWithKeywords,
  findBookmarkWithAtLeastNKeywords,
} from "../test-utils/bookmarkTestUtils";
import { KeywordTable } from "./KeywordTable";

describe("KeywordTableのテスト", () => {
  it("キーワードのリストが空の場合、ヘッダー行のみ表示されデータ行は表示されない", () => {
    const mockOnSelectKeyword = vi.fn<(keywordId: number) => void>();
    render(<KeywordTable keywords={[]} setSelectedKeywordId={mockOnSelectKeyword} />);
    const keywordTable = screen.getByRole("table", { name: "キーワードのテーブル" });
    expect(keywordTable).toBeVisible();

    const rows = screen.queryAllByRole("row");
    expect(rows).toHaveLength(1); // ヘッダー行のみ

    const cells = screen.queryAllByRole("cell");
    expect(cells).toHaveLength(0); // データセルは存在しない
  });

  it("キーワードのリストが渡された場合、すべてのキーワードが正しく表示される", () => {
    const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(buildMockBookmarksWithKeywords());
    const keywords = bookmarkToSelect.keywords;
    expect(keywords.length).toBeGreaterThan(0); // Ensure test data is valid
    const mockOnSelectKeyword = vi.fn<(keywordId: number) => void>();

    render(<KeywordTable keywords={keywords} setSelectedKeywordId={mockOnSelectKeyword} />);
    // `getAllByRole` is used here as we expect rows to be present.
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(keywords.length + 1);

    keywords.forEach((keyword, index) => {
      const row = rows[index + 1];
      const cell = within(row).getByRole("cell");
      expect(cell).toHaveTextContent(keyword.keyword_name);
    });
  });

  describe("キーワードをクリックするテスト", () => {
    let user: UserEvent;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it("キーワードがクリックされたことを確認する", async () => {
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(buildMockBookmarksWithKeywords());
      const keywords = bookmarkToSelect.keywords;
      expect(keywords.length).toBeGreaterThan(0); // Ensure test data is valid
      const mockOnSelectKeyword = vi.fn<(keywordId: number) => void>();

      render(<KeywordTable keywords={keywords} setSelectedKeywordId={mockOnSelectKeyword} />);

      const row = screen.getByTestId(`keyword-row-${keywords[0].keyword_id}`);
      await user.click(row);

      expect(mockOnSelectKeyword).toHaveBeenCalledWith(keywords[0].keyword_id);
    });

    it("キーワードがクリックされると、選択されたことを示すために背景色が変更される", async () => {
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(
        buildMockBookmarksWithKeywords(),
        2
      );
      const keywords = bookmarkToSelect.keywords;
      expect(keywords.length).toBeGreaterThan(1); // Ensure test data is valid
      const mockOnSelectKeyword = vi.fn<(keywordId: number) => void>();

      const { rerender } = render(
        <KeywordTable
          keywords={keywords}
          setSelectedKeywordId={mockOnSelectKeyword}
          selectedKeywordId={undefined}
        />
      );

      const keywordToClick = keywords[0];
      const otherKeyword = keywords[1];

      const rowToClick = screen.getByTestId(`keyword-row-${keywordToClick.keyword_id}`);
      await user.click(rowToClick);

      expect(mockOnSelectKeyword).toHaveBeenCalledWith(keywordToClick.keyword_id);

      // selectedKeywordIdを更新して再レンダリング
      rerender(
        <KeywordTable
          keywords={keywords}
          setSelectedKeywordId={mockOnSelectKeyword}
          selectedKeywordId={keywordToClick.keyword_id}
        />
      );

      expect(within(rowToClick).getByRole("cell")).toHaveClass(ROW_STYLE_KEYWORD_SELECTED);
      expect(
        within(screen.getByTestId(`keyword-row-${otherKeyword.keyword_id}`)).getByRole("cell")
      ).not.toHaveClass(ROW_STYLE_KEYWORD_SELECTED);
    });
  });
});
