import { beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import { LINKED_KEYWORD, LINKPAGE_BOOKMARK, mockBookmarks } from "../test-utils/bookmarkTestUtils";
import { Bookmark } from "../types/Bookmark";
import { useBookmarkManager } from "./useBookmarkManager";
import { Keyword } from "../types/Keyword";

describe("useBookmarkManager", () => {
  let bookmarks: Bookmark[];
  let getBookmarks: () => Promise<void>;
  let getKeywords: () => Promise<void>;
  let deleteBookmark: (bookmark_id: number) => Promise<void>;
  let updateBookmark: (bookmark_id: number, url: string, title: string) => Promise<void>;
  let addKeyword: (bookmark_id: number, keyword_name: string) => Promise<void>;
  let unlinkKeyword: (bookmark_id: number, keyword_id: number) => Promise<void>;

  beforeEach(() => {
    bookmarks = mockBookmarks;
    getBookmarks = vi.fn();
    getKeywords = vi.fn();
    deleteBookmark = vi.fn();
    updateBookmark = vi.fn();
    addKeyword = vi.fn();
    unlinkKeyword = vi.fn();
  });

  // フックをレンダリングするヘルパー関数
  const renderMyHook = () => {
    return renderHook(() =>
      useBookmarkManager({
        bookmarks,
        getBookmarks,
        getKeywords,
        deleteBookmark,
        updateBookmark,
        addKeyword,
        unlinkKeyword,
      })
    );
  };

  describe("getBookmarks", () => {
    it("useBookmarkManagerを初期化するとgetBookmarksが呼び出される", async () => {
      const { result } = renderMyHook();

      // 結果を検証する
      await waitFor(() => {
        // getBookmarksの呼び出し
        expect(getBookmarks).toHaveBeenCalledWith();

        // エラーメッセージとキーワードのテキストボックス
        expect(result.current.textMessage).toBe("");
        expect(result.current.selectedBookmarkId).toBe(undefined);
      });
    });
  });

  describe("不正な入力の場合", () => {
    it("ブックマークを選択しないでボタンをクリックしても関数は呼び出されない", async () => {
      // Arrange
      const { result } = renderMyHook();

      // Act
      await act(async () => {
        await Promise.all([
          result.current.deleteClick(),
          result.current.updateClick(),
          result.current.addKeywordClick(),
          result.current.unlinkKeywordClick(LINKED_KEYWORD),
        ]);
      });

      // Assert
      expect(deleteBookmark).not.toHaveBeenCalled();
      expect(updateBookmark).not.toHaveBeenCalled();
      expect(addKeyword).not.toHaveBeenCalled();
      expect(unlinkKeyword).not.toHaveBeenCalled();
    });
  });

  describe("ブックマーク選択後のテスト", () => {
    let result: ReturnType<typeof renderMyHook>["result"];

    beforeEach(async () => {
      const hook = renderMyHook();
      result = hook.result;

      act(() => {
        result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
      });

      await waitFor(() => {
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
      });
    });

    it("キーワードを指定しないで設定ボタンをクリックするとlinkKeywordが呼び出されない", async () => {
      // Arrange: 空のキーワードで設定ボタンのクリックをシミュレートする
      const emptyKeyword: Keyword = { keyword_id: 0, keyword_name: "" };
      await act(async () => {
        await result.current.linkKeywordClick(emptyKeyword);
      });

      // Assert: addKeywordが呼び出されないことを確認
      await waitFor(() => {
        expect(addKeyword).not.toHaveBeenCalled();
      });
    });

    describe("正常系のテスト", () => {
      it("削除ボタンをクリックするとdeleteBookmarkが呼び出される", async () => {
        // Act
        await act(async () => {
          await result.current.deleteClick();
        });

        // Assert
        await waitFor(() => {
          expect(deleteBookmark).toHaveBeenCalledWith(LINKPAGE_BOOKMARK.bookmark_id);
          expect(result.current.textMessage).toBe("");
          expect(result.current.selectedBookmarkId).toBe(undefined);
        });
      });

      it("「更新」ボタンをクリックするとupdateBookmarkが呼び出される", async () => {
        // Act
        await act(async () => {
          await result.current.updateClick();
        });

        // Assert
        await waitFor(() => {
          expect(updateBookmark).toHaveBeenCalledWith(
            LINKPAGE_BOOKMARK.bookmark_id,
            LINKPAGE_BOOKMARK.url,
            LINKPAGE_BOOKMARK.title
          );
          expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
          expect(result.current.textTitle).toBe(LINKPAGE_BOOKMARK.title);
          expect(result.current.textMessage).toBe("");
          expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
        });
      });

      it("キーワードを入力して「追加」ボタンをクリックするとaddKeywordが呼び出される", async () => {
        // Arrange
        const newKeyword = "new keyword";
        act(() => {
          result.current.setTextKeyword(newKeyword);
        });
        expect(result.current.textKeyword).toBe(newKeyword);

        // Act
        await act(async () => {
          await result.current.addKeywordClick();
        });

        // Assert
        await waitFor(() => {
          expect(addKeyword).toHaveBeenCalledWith(LINKPAGE_BOOKMARK.bookmark_id, newKeyword);
          expect(result.current.textMessage).toBe("");
          expect(result.current.textKeyword).toBe("");
        });
      });

      it("キーワードの解除ボタンをクリックするとunlinkKeywordが呼び出される", async () => {
        // Act
        await act(async () => {
          await result.current.unlinkKeywordClick(LINKED_KEYWORD);
        });

        // Assert
        await waitFor(() => {
          expect(unlinkKeyword).toHaveBeenCalledWith(
            LINKPAGE_BOOKMARK.bookmark_id,
            LINKED_KEYWORD.keyword_id
          );
          expect(result.current.textMessage).toBe("");
          expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
        });
      });

      it("キーワードの設定ボタンをクリックするとaddKeyword(linkKeyword)が呼び出される", async () => {
        // Act
        await act(async () => {
          await result.current.linkKeywordClick(LINKED_KEYWORD);
        });

        // Assert
        await waitFor(() => {
          expect(addKeyword).toHaveBeenCalledWith(
            LINKPAGE_BOOKMARK.bookmark_id,
            LINKED_KEYWORD.keyword_name
          );
          expect(result.current.textMessage).toBe("");
          expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
        });
      });
    });

    describe("エラー系のテスト", () => {
      it("deleteClick: deleteBookmarkに失敗するとエラーメッセージが表示される", async () => {
        // Arrange
        vi.mocked(deleteBookmark).mockRejectedValueOnce(new Error("エラーが発生しました"));

        // Act
        await act(async () => {
          await result.current.deleteClick();
        });

        // Assert
        await waitFor(() => {
          // deleteBookmarkの呼び出し
          expect(deleteBookmark).toHaveBeenCalledWith(LINKPAGE_BOOKMARK.bookmark_id);

          // エラーメッセージと選択されたブックマーク
          expect(result.current.textMessage).toBe("エラーが発生しました");
          expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
        });
      });

      it("updateClick: updateBookmarkに失敗するとエラーメッセージが表示される", async () => {
        // Arrange
        vi.mocked(updateBookmark).mockRejectedValueOnce(new Error("エラーが発生しました"));

        // Act
        await act(async () => {
          await result.current.updateClick();
        });

        // Assert
        await waitFor(() => {
          // updateBookmarkの呼び出し
          expect(updateBookmark).toHaveBeenCalledWith(
            LINKPAGE_BOOKMARK.bookmark_id,
            LINKPAGE_BOOKMARK.url,
            LINKPAGE_BOOKMARK.title
          );

          // エラーメッセージと選択されたブックマーク
          expect(result.current.textMessage).toBe("エラーが発生しました");
          expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
        });
      });

      it("addKeywordClick: addKeywordに失敗するとエラーメッセージが表示される", async () => {
        // Arrange
        vi.mocked(addKeyword).mockRejectedValueOnce(new Error("エラーが発生しました"));

        const newKeyword = "new keyword";
        act(() => {
          result.current.setTextKeyword(newKeyword);
        });
        await waitFor(() => {
          expect(result.current.textKeyword).toBe(newKeyword);
        });

        // Act
        await act(async () => {
          await result.current.addKeywordClick();
        });

        // Assert
        await waitFor(() => {
          // addKeywordの呼び出し
          expect(addKeyword).toHaveBeenCalledWith(LINKPAGE_BOOKMARK.bookmark_id, newKeyword);

          // エラーメッセージと選択されたブックマーク
          expect(result.current.textMessage).toBe("エラーが発生しました");
          expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
        });
      });

      it("unlinkKeywordClick: unlinkKeywordに失敗するとエラーメッセージが表示される", async () => {
        // Arrange
        vi.mocked(unlinkKeyword).mockRejectedValueOnce(new Error("エラーが発生しました"));

        // Act
        await act(async () => {
          await result.current.unlinkKeywordClick(LINKED_KEYWORD);
        });

        // Assert
        await waitFor(() => {
          // unlinkKeywordの呼び出し
          expect(unlinkKeyword).toHaveBeenCalledWith(
            LINKPAGE_BOOKMARK.bookmark_id,
            LINKED_KEYWORD.keyword_id
          );

          // エラーメッセージと選択されたブックマーク
          expect(result.current.textMessage).toBe("エラーが発生しました");
          expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
        });
      });

      it("linkKeywordClick: addKeywordに失敗するとエラーメッセージが表示される", async () => {
        // Arrange
        vi.mocked(addKeyword).mockRejectedValueOnce(new Error("エラーが発生しました"));

        // Act
        await act(async () => {
          await result.current.linkKeywordClick(LINKED_KEYWORD);
        });

        // Assert
        await waitFor(() => {
          // addKeywordの呼び出し
          expect(addKeyword).toHaveBeenCalledWith(
            LINKPAGE_BOOKMARK.bookmark_id,
            LINKED_KEYWORD.keyword_name
          );

          // エラーメッセージと選択されたブックマーク
          expect(result.current.textMessage).toBe("エラーが発生しました");
          expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
        });
      });
    });
  });
});
