import fetch from "cross-fetch";

import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { Bookmark } from "../page";

describe("ブックマークのAPIのテスト", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("ブックマークのデータが取得できる", () => {
    const url = "http://localhost:3030/bookmark";
    const mockBookmarks: Bookmark[] = [
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

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    return fetch(url).then((response) => {
      response.json().then((json) => {
        expect(json).toEqual([
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
});
