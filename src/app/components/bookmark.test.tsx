import { Bookmarks } from "./bookmark";

/***
 * このテストは、Bookmarksaクラスのインスタンスを生成し、そのインスタンスのをテストします。
 * Bookmarksクラスは、ブックマークのデータを管理するクラスです。
 * Bookmarksクラスは、タグを指定することができます。
 * タグを指定しない場合、ブックマークのデータは空の配列となります。
 * タグに"github"を指定した場合、ブックマークのデータは、
 * [{"url":"https://github.com/kubotama/linkpage","title":"kubotama/linkpage", "tags":["github"]}]となります。
 * タグに"google"を指定した場合、ブックマークのデータは、
 * [{"url":"https://www.google.com/","title":"Google", "tags":["google"]},
 * {"url":"https://mail.google.com","title":"Gmail","tags":["google"]}]となります。
 * タグに"日次"を指定した場合、ブックマークのデータは、
 * [{"url":"https://www.amazon.co.jp/","title":"Amazon", "tags":["日次"]},
 * {"url":"https://mail.google.com","title":"Gmail","tags":["google", "日次"]}]となります。
 **/

describe("ブックマークのデータのクラスのテスト", () => {
  it("タグを指定しない場合の長さ0の配列が戻る", () => {
    const tag = "";
    const bookmarks = Bookmarks(tag);
    expect(bookmarks).toHaveLength(0);
  });

  it("タグに'github'を指定した場合、正しいブックマークデータが戻る", () => {
    const tag = "github";
    const bookmarks = Bookmarks(tag);
    expect(bookmarks).toEqual([
      {
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
        tags: ["github"],
      },
    ]);
  });

  it("タグに'google'を指定した場合、正しいブックマークデータが戻る", () => {
    const tag = "google";
    const bookmarks = Bookmarks(tag);
    expect(bookmarks).toEqual([
      {
        url: "https://www.google.com/",
        title: "Google",
        tags: ["google"],
      },
      {
        url: "https://mail.google.com",
        title: "Gmail",
        tags: ["google", "日次"],
      },
    ]);
  });

  it("タグに'日次'を指定した場合、正しいブックマークデータが戻る", () => {
    const tag = "日次";
    const bookmarks = Bookmarks(tag);
    expect(bookmarks).toEqual([
      {
        url: "https://mail.google.com",
        title: "Gmail",
        tags: ["google", "日次"],
      },
      {
        url: "https://www.amazon.co.jp/",
        title: "Amazon",
        tags: ["日次"],
      },
    ]);
  });
});
