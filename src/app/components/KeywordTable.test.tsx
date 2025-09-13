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
  let mockOnSelectKeyword = vi.fn<(keywordId: number | undefined) => void>();

  beforeEach(() => {
    mockOnSelectKeyword = vi.fn();
  });

  it("キーワードのリストが空の場合、ヘッダー行のみ表示されデータ行は表示されない", () => {
    const { container } = render(
      <KeywordTable keywords={[]} setSelectedKeywordId={mockOnSelectKeyword} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("キーワードのリストが渡された場合、すべてのキーワードが正しく表示される", () => {
    const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(buildMockBookmarksWithKeywords());
    const keywords = bookmarkToSelect.keywords;
    expect(keywords.length).toBeGreaterThan(0); // Ensure test data is valid

    render(<KeywordTable keywords={keywords} setSelectedKeywordId={mockOnSelectKeyword} />);

    // theadとtbodyはrowgroupロールを持つ
    const [thead, tbody] = screen.getAllByRole("rowgroup");
    expect(within(thead).getByRole("row")).toBeInTheDocument();

    const rows = within(tbody).getAllByRole("row");
    expect(rows).toHaveLength(keywords.length);

    keywords.forEach((keyword, index) => {
      const row = rows[index];
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

    it("選択状態のキーワードをクリックすると、選択が解除され、キーワードのハイライトが元の表示に戻る", async () => {
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(buildMockBookmarksWithKeywords());
      const keywords = bookmarkToSelect.keywords;
      expect(keywords.length).toBeGreaterThan(0);
      const selectedKeyword = keywords[0];

      const { rerender } = render(
        <KeywordTable
          keywords={keywords}
          setSelectedKeywordId={mockOnSelectKeyword}
          selectedKeywordId={selectedKeyword.keyword_id}
        />
      );

      const selectedRow = screen.getByTestId(`keyword-row-${selectedKeyword.keyword_id}`);
      const selectedCell = within(selectedRow).getByRole("cell");

      // 初期状態で選択されていることを確認
      expect(selectedCell).toHaveClass(ROW_STYLE_KEYWORD_SELECTED);

      // 選択されている行を再度クリック
      await user.click(selectedRow);

      // 選択解除の関数が undefined で呼び出されることを確認
      expect(mockOnSelectKeyword).toHaveBeenCalledWith(undefined);

      // 選択が解除された状態で再レンダリング
      rerender(<KeywordTable keywords={keywords} setSelectedKeywordId={mockOnSelectKeyword} />);

      // ハイライトが解除されていることを確認
      expect(selectedCell).not.toHaveClass(ROW_STYLE_KEYWORD_SELECTED);
    });
  });
});
