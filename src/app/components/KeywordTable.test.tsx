import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import {
  ROW_STYLE_KEYWORD_SELECTED,
  TABLE_NAME_LINKED_KEYWORD,
  TABLE_HEADER_LINKED_KEYWORD,
  UNLINK_BUTTON_ROLE_NAME,
} from "../constants/constants";
import {
  buildMockBookmarksWithKeywords,
  findBookmarkWithAtLeastNKeywords,
} from "../test-utils/bookmarkTestUtils";
import { KeywordTable } from "./KeywordTable";

describe("KeywordTableのテスト", () => {
  let mockOnSelectKeyword = vi.fn<(keywordId: number | undefined) => void>();
  let mockOnUnlinkKeyword = vi.fn();

  beforeEach(() => {
    mockOnSelectKeyword = vi.fn();
    mockOnUnlinkKeyword = vi.fn();
  });

  it("キーワードのリストが空の場合、ヘッダー行のみ表示されデータ行は表示されない", () => {
    const { container } = render(
      <KeywordTable
        keywords={[]}
        headerText={TABLE_HEADER_LINKED_KEYWORD}
        labelText={TABLE_NAME_LINKED_KEYWORD}
        setSelectedKeywordId={mockOnSelectKeyword}
        rowActionButton={{
          label: UNLINK_BUTTON_ROLE_NAME,
          onClick: mockOnUnlinkKeyword,
        }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("キーワードのリストが渡された場合、すべてのキーワードが正しく表示される", () => {
    const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(buildMockBookmarksWithKeywords());
    const keywords = bookmarkToSelect.keywords;
    expect(keywords.length).toBeGreaterThan(0); // Ensure test data is valid

    render(
      <KeywordTable
        keywords={keywords}
        headerText={TABLE_HEADER_LINKED_KEYWORD}
        labelText={TABLE_NAME_LINKED_KEYWORD}
        setSelectedKeywordId={mockOnSelectKeyword}
        rowActionButton={{
          label: UNLINK_BUTTON_ROLE_NAME,
          onClick: mockOnUnlinkKeyword,
        }}
      />
    );

    // theadとtbodyはrowgroupロールを持つ
    const [thead, tbody] = screen.getAllByRole("rowgroup");
    expect(within(thead).getByRole("row")).toBeInTheDocument();

    const rows = within(tbody).getAllByRole("row");
    expect(rows).toHaveLength(keywords.length);

    keywords.forEach((keyword, index) => {
      const row = rows[index];
      const [keywordLabel, unlinkButton] = within(row).getAllByRole("cell");
      expect(keywordLabel).toHaveTextContent(keyword.keyword_name);
      expect(unlinkButton).toHaveTextContent(UNLINK_BUTTON_ROLE_NAME);
    });
  });

  describe("キーワードの選択/選択解除のテスト", () => {
    let user: UserEvent;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it("キーワード行がクリックされたらonSelectKeywordが呼ばれる", async () => {
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(buildMockBookmarksWithKeywords());
      const keywords = bookmarkToSelect.keywords;
      expect(keywords.length).toBeGreaterThan(0); // Ensure test data is valid

      render(
        <KeywordTable
          keywords={keywords}
          headerText={TABLE_HEADER_LINKED_KEYWORD}
          labelText={TABLE_NAME_LINKED_KEYWORD}
          setSelectedKeywordId={mockOnSelectKeyword}
          rowActionButton={{
            label: UNLINK_BUTTON_ROLE_NAME,
            onClick: mockOnUnlinkKeyword,
          }}
        />
      );

      const keywordCell = screen.getByText(keywords[0].keyword_name);
      await user.click(keywordCell);

      // onSelectKeywordが正しいIDで呼び出されることを確認
      expect(mockOnSelectKeyword).toHaveBeenCalledWith(keywords[0].keyword_id);
    });

    it("selectedKeywordIdが渡された場合、対応するキーワードがハイライト表示される", () => {
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(
        buildMockBookmarksWithKeywords(),
        2
      );
      const keywords = bookmarkToSelect.keywords;
      expect(keywords.length).toBeGreaterThan(1); // Ensure test data is valid
      const selectedKeyword = keywords[0];
      const otherKeyword = keywords[1];

      render(
        <KeywordTable
          keywords={keywords}
          headerText={TABLE_HEADER_LINKED_KEYWORD}
          labelText={TABLE_NAME_LINKED_KEYWORD}
          setSelectedKeywordId={mockOnSelectKeyword}
          selectedKeywordId={selectedKeyword.keyword_id}
          rowActionButton={{
            label: UNLINK_BUTTON_ROLE_NAME,
            onClick: mockOnUnlinkKeyword,
          }}
        />
      );

      const selectedRow = screen.getByTestId(`keyword-row-${selectedKeyword.keyword_id}`);
      expect(selectedRow).toHaveClass(ROW_STYLE_KEYWORD_SELECTED);
      // 他の行はハイライトされていないことを確認
      expect(screen.getByTestId(`keyword-row-${otherKeyword.keyword_id}`)).not.toHaveClass(
        ROW_STYLE_KEYWORD_SELECTED
      );
    });

    it("選択状態のキーワードをクリックすると、setSelectedKeywordId(undefined)が呼ばれる", async () => {
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(buildMockBookmarksWithKeywords());
      const keywords = bookmarkToSelect.keywords;
      expect(keywords.length).toBeGreaterThan(0);
      const selectedKeyword = keywords[0];

      render(
        <KeywordTable
          keywords={keywords}
          headerText={TABLE_HEADER_LINKED_KEYWORD}
          labelText={TABLE_NAME_LINKED_KEYWORD}
          setSelectedKeywordId={mockOnSelectKeyword}
          selectedKeywordId={selectedKeyword.keyword_id}
          rowActionButton={{
            label: UNLINK_BUTTON_ROLE_NAME,
            onClick: mockOnUnlinkKeyword,
          }}
        />
      );

      const selectedRow = screen.getByTestId(`keyword-row-${selectedKeyword.keyword_id}`);

      // 初期状態で選択されていることを確認
      expect(selectedRow).toHaveClass(ROW_STYLE_KEYWORD_SELECTED);

      // 選択されている行を再度クリック
      await user.click(selectedRow);

      // 選択解除の関数が undefined で呼び出されることを確認
      expect(mockOnSelectKeyword).toHaveBeenCalledWith(undefined);
    });
  });

  describe("キーワードの解除ボタンをクリックするテスト", () => {
    let user: UserEvent;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it("解除ボタンがクリックされたらunlinkKeywordClickが呼ばれる", async () => {
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(buildMockBookmarksWithKeywords());
      const keywords = bookmarkToSelect.keywords;
      const keywordToUnlink = keywords[0];

      render(
        <KeywordTable
          keywords={keywords}
          headerText={TABLE_HEADER_LINKED_KEYWORD}
          labelText={TABLE_NAME_LINKED_KEYWORD}
          setSelectedKeywordId={mockOnSelectKeyword}
          rowActionButton={{
            label: UNLINK_BUTTON_ROLE_NAME,
            onClick: mockOnUnlinkKeyword,
          }}
        />
      );

      const unlinkButton = screen.getAllByRole("button", { name: UNLINK_BUTTON_ROLE_NAME })[0];
      await user.click(unlinkButton);

      expect(mockOnUnlinkKeyword).toHaveBeenCalledWith(keywordToUnlink.keyword_id);
    });
  });
});
