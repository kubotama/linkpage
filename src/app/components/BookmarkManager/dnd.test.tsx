import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  MockedFunction,
  MockInstance,
  test,
  vi,
} from "vitest";

import { BookmarkManager } from "../BookmarkManager";
import { useBookmarks } from "../../hooks/useBookmark";
import { Bookmark } from "../../types/Bookmark";

// useBookmarksフックをモック
vi.mock("../../hooks/useBookmark", async (importOriginal) => {
  const actual = await importOriginal<typeof useBookmarks>();
  return {
    ...actual,
    useBookmarks: vi.fn(),
  };
});

// useBookmarkLogicフックをモック
vi.mock("../../hooks/useBookmarkLogic", () => ({
  useBookmarksLogic: ({
    bookmarks,
    filteredBookmarks: bookmarksByKeyword,
  }: {
    bookmarks: Bookmark[];
    filteredBookmarks: Bookmark[] | undefined;
  }) => ({
    handleSelectBookmark: vi.fn(),
    handleSelectKeyword: vi.fn(),
    handleUpdateBookmark: vi.fn(),
    handleDeleteBookmark: vi.fn(),
    handleOpenBookmark: vi.fn(),
    handleOpenAllBookmarks: vi.fn(),
    handleCopyBookmark: vi.fn(),
    handleCopyAllBookmarks: vi.fn(),
    handleShowAllBookmarks: vi.fn(),
    handleShowLinkedBookmarks: vi.fn(),
    handleLinkBookmark: vi.fn(),
    handleViewKeywords: vi.fn(),
    handleAddKeyword: vi.fn(),
    handleUnlinkBookmark: vi.fn(),

    // レンダリングに必要なプロパティを追加
    filteredBookmarks: bookmarksByKeyword || bookmarks,
    selectedBookmark: undefined,
    isEditing: false,
    editingBookmark: null,
    isKeywordTableVisible: false,
    bookmarkKeywords: [],
    isEnableAddKeywordButton: false,
    linkedBookmarkWithSelectedKeywords: [],
  }),
}));

// process.env.NODE_ENVをテスト中に変更するため、元の値を保持
const originalNodeEnv = process.env.NODE_ENV;

const mockBookmarks: Bookmark[] = [
  { bookmark_id: 1, title: "Bookmark A", url: "https://a.com", order: 1, keywords: [] },
  { bookmark_id: 2, title: "Bookmark B", url: "https://b.com", order: 2, keywords: [] },
  { bookmark_id: 3, title: "Bookmark C", url: "https://c.com", order: 3, keywords: [] },
];

describe("BookmarkManager Drag and Drop", () => {
  let setBookmarks: MockInstance;
  let originalGetBoundingClientRect: typeof Element.prototype.getBoundingClientRect;

  beforeEach(() => {
    originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = vi.fn(function (this: Element): DOMRect {
      // 'tr'要素に限定してモックを適用
      if (this.tagName.toLowerCase() === "tr") {
        const rows = Array.from(document.body.querySelectorAll("tr"));
        const index = rows.indexOf(this);

        if (index > -1) {
          const top = index * 30; // 各行の高さが30pxと仮定
          return {
            width: 200,
            height: 30,
            top: top,
            left: 0,
            bottom: top + 30,
            right: 200,
            x: 0,
            y: top,
            toJSON: () => ({} as DOMRectInit),
          };
        }
      }

      // 他の要素の場合は、元の関数を呼び出す
      return originalGetBoundingClientRect.call(this);
    });

    // テスト実行前にNODE_ENVを'development'に設定し、D&D機能を有効化
    process.env.NODE_ENV = "development";

    setBookmarks = vi.fn();
    const mockUseBookmarks = useBookmarks as MockedFunction<typeof useBookmarks>;
    mockUseBookmarks.mockReturnValue({
      bookmarks: [...mockBookmarks], // 変更可能なコピーを渡す
      setBookmarks: setBookmarks,
      keywords: [],
      getBookmarks: vi.fn(),
      getKeywords: vi.fn(),
      addBookmark: vi.fn(),
      updateBookmark: vi.fn(),
      deleteBookmark: vi.fn(),
      addKeyword: vi.fn(),
      getBookmarkKeywords: vi.fn(),
      unlinkBookmark: vi.fn(),
      selectedBookmarkId: undefined,
      setSelectedBookmarkId: vi.fn(),
      selectedKeywordId: undefined,
      setSelectedKeywordId: vi.fn(),
      filteredBookmarks: undefined,
      textKeyword: "",
    });
  });

  afterEach(() => {
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    // テスト実行後にNODE_ENVを元の値に戻す
    process.env.NODE_ENV = originalNodeEnv;
    vi.clearAllMocks();
  });

  test("should reorder bookmarks when dragging and dropping", async () => {
    render(<BookmarkManager />);

    // 初期状態の確認
    const table = screen.getByRole("table", { name: "すべてのブックマークのテーブル" });
    const rows = table.querySelectorAll("tr");
    // ヘッダー行 + データ行
    expect(rows).toHaveLength(4);
    expect(rows[1]).toHaveTextContent("Bookmark A");
    expect(rows[2]).toHaveTextContent("Bookmark B");
    expect(rows[3]).toHaveTextContent("Bookmark C");

    const itemA = screen.getByRole("button", { name: "Bookmark A" });

    const user = userEvent.setup();

    // itemA にフォーカス
    itemA.focus();
    expect(itemA).toHaveFocus();

    // ドラッグ開始
    await user.keyboard("[Space]");

    // itemA を一番下に移動 (2回下に押す)
    await user.keyboard("[ArrowDown]");
    await user.keyboard("[ArrowDown]");

    // ドロップ
    await user.keyboard("[Space]");

    // setBookmarksが呼び出されたことを確認
    expect(setBookmarks).toHaveBeenCalledOnce();

    // setBookmarksに渡されたコールバック関数を実行して、並び替え後の状態を検証
    const updater = setBookmarks.mock.calls[0][0];
    const reorderedBookmarks = updater([...mockBookmarks]); // 元の配列のコピーを渡す

    expect(reorderedBookmarks.map((b) => b.title)).toEqual([
      "Bookmark B",
      "Bookmark C",
      "Bookmark A",
    ]);
  });
});
