import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

import { GET } from "./route";

describe("タイトルを取得するAPIのテスト", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("github.com/kubotama/linkpage", () => {
    fetchMock.mockResponseOnce(
      "<html><head><title>link page</title></head><body></body></html>"
    );

    return GET().then((response) => {
      expect(response.status).toBe(200);
      return response.text().then((text) => {
        expect(text).toBe("link page");
      });
    });
  });
});
