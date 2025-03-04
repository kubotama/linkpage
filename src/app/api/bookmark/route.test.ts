import "@testing-library/jest-dom";

import * as fs from "fs/promises";

import { Bookmark } from "../../components/bmRow";
import { GET, POST } from "./route";

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

describe("ブックマークを更新できる", () => {
  it("ブックマークのデータが更新できる", async () => {
    const bookmarks: Bookmark[] = [
      {
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
      },
      {
        url: "https://www.google.com/",
        title: "Google",
      },
    ];

    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const response = await POST(
      new Request("http://localhost:3000/api/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmarks),
      })
    );

    expect(response.status).toBe(200);
    expect(fs.writeFile).toHaveBeenCalledWith(
      "./bookmark.json",
      JSON.stringify(bookmarks),
      "utf-8"
    );
  });

  it("不正なJSONデータの場合はエラーを返す", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      })
    );

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toMatch(/invalid json/);
  });

  it("ファイルの書き込みに失敗した場合はエラーを返す", async () => {
    const bookmarks: Bookmark[] = [
      { url: "https://example.com", title: "Example" },
    ];

    (fs.writeFile as jest.Mock).mockRejectedValue(new Error("Write failed"));

    const response = await POST(
      new Request("http://localhost:3000/api/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmarks),
      })
    );

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe("Write failed");
  });
});
