// import fetch from "cross-fetch";

import "@testing-library/jest-dom";
import * as fs from "fs";

import { Bookmark } from "../components/bmRow";
import { GET } from "./route";

jest.mock("fs");

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

describe("ブックマークのAPIのテスト", () => {
  it("ブックマークのデータが取得できる", async () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(bookmarks));

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(bookmarks);
  });

  it("ブックマークのファイルが存在しない場合", async () => {
    // ブックマークのファイルが存在しない場合、エラーコード(500)、エラーメッセージ(Bookmark file not found)を返す。
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("File not found");
    });

    const response = await GET();
    expect(response.status).toBe(500);
    const json = await response.text();
    expect(json).toEqual("File not found");
  });

  it("ブックマークのファイルから読み込んだデータが正しいJSON形式でない場合", async () => {
    // ブックマークのファイルから読み込んだデータが正しいJSON形式かどうかを確認して、
    // 正しいJSON形式でない場合、エラーコード(500)、エラーメッセージ(The bookmark file is not the correct JSON format)を返す。
    (fs.readFileSync as jest.Mock).mockReturnValue([]);

    const response = await GET();
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toEqual("Unexpected end of JSON input");
  });
});
