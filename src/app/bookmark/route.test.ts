// import fetch from "cross-fetch";

import "@testing-library/jest-dom";
import * as fs from "fs";

import { Bookmark } from "../components/bmRow";
import { GET } from "./route";

jest.mock("fs");

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

    (fs.readFileSync as jest.Mock).mockReturnValue(bookmarks);

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(bookmarks);
  });
});
