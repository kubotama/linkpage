import "@testing-library/jest-dom";
import * as fs from "fs/promises";
import { Bookmark } from "../../components/bmRow";
import { GET } from "./route";

jest.mock("fs/promises");

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

    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(bookmarks));

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(bookmarks);
  });

  it("ブックマークのファイルが存在しない場合", async () => {
    (fs.readFile as jest.Mock).mockRejectedValue(new Error("File not found"));

    const response = await GET();
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toEqual("File not found");
  });

  it("ブックマークのファイルから読み込んだデータが正しいJSON形式でない場合", async () => {
    (fs.readFile as jest.Mock).mockResolvedValue("invalid json");

    const response = await GET();
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toEqual(
      "Unexpected token 'i', \"invalid json\" is not valid JSON"
    );
  });
});
