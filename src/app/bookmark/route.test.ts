import fetch from "cross-fetch";

import "@testing-library/jest-dom";

describe("ブックマークのAPIのテスト", () => {
  it("ブックマークのデータが取得できる", () => {
    const url = "http://localhost:3001/bookmark";
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
