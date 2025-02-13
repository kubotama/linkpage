import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

import { GET } from "./route";

describe("タイトルを取得するAPIのテスト", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("github.com/kubotama/linkpage", () => {
    const url = "https://github.com/kubotama/linkpage";
    fetchMock.mockResponseOnce(
      "<html><head><title>link page</title></head><body></body></html>"
    );

    return GET(url).then((response) => {
      expect(response.status).toBe(200);
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(url); // Update the expected URL here
      return response.text().then((text) => {
        expect(text).toBe("link page");
      });
    });
  });
});
