import { Bookmarks } from "./bmGrid";

/***
 * このテストは、Bookmarksクラスのインスタンスを生成し、そのインスタンスのをテストします。
 * Bookmarksクラスは、ブックマークのデータを定義するクラスです。
 * Bookmarksクラスに定義されているブックマークを返します。
 **/

describe("ブックマークのデータのテスト", () => {
  it("定義されているブックマークが返る", () => {
    return Bookmarks().then((bookmarks) => {
      expect(bookmarks).toEqual([
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
      ]);
    });
  });
});
