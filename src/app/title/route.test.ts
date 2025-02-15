import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

import { GET } from "./route";

describe("タイトルを取得するAPIのテスト", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("github.com/kubotama/linkpage", async () => {
    const url = "https://github.com/kubotama/linkpage";
    fetchMock.mockResponseOnce(
      "<html><head><title>link page</title></head><body></body></html>"
    );

    const response = await GET(url);
    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(url); // Update the expected URL here
    const text = await response.text();
    expect(text).toBe("link page");
  });

  it("https://www.google.com/", async () => {
    const url = "https://www.google.com/";
    fetchMock.mockResponseOnce(
      "<html><head><title>Google</title></head><body></body></html>"
    );

    const response = await GET(url);
    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(url); // Update the expected URL here
    const text = await response.text();
    expect(text).toBe("Google");
  });

  it("URLから返されたHTMLにタイトルがない場合、エラーを返す", async () => {
    const url = "https://www.google.com/";
    fetchMock.mockResponseOnce("<html><head></head><body></body></html>");

    await expect(GET(url)).rejects.toThrow("Can't find title");
  });
});
