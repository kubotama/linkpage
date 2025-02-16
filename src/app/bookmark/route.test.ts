// import fetch from "cross-fetch";

import "@testing-library/jest-dom";

import { Bookmark } from "../components/bmRow";
import { GET } from "./route";

describe("ブックマークのAPIのテスト", () => {
  it("ブックマークのデータが取得できる", async () => {
    const bookmarks: Bookmark[] = [
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

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(bookmarks);
  });
});
