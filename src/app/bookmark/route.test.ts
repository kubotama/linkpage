import fetch from "cross-fetch";

import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

describe("ブックマークのAPIのテスト", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("ブックマークのデータが取得できる", () => {
    const url = "http://localhost:3000/bookmark";
    const mockBookmarks = [
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
