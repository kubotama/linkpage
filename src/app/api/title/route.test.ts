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

    const request = new Request(
      new URL("/title?url=" + url, "http://localhost")
    );
    const response = await GET(request);
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

    const request = new Request(
      new URL("/title?url=" + url, "http://localhost")
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(url); // Update the expected URL here
    const text = await response.text();
    expect(text).toBe("Google");
  });

  it("URLから返されたHTMLにタイトルがない場合、エラーを返す", async () => {
    const url = "https://www.google.com/";
    fetchMock.mockResponseOnce("<html><head></head><body></body></html>");

    const request = new Request(
      new URL("/title?url=" + url, "http://localhost")
    );
    const response = await GET(request);
    const text = await response.text();
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(url); // Update the expected URL here
    expect(response.status).toBe(500);
    expect(text).toBe("Can't find title");
  });

  it("URLが存在しない場合、エラーを返す", async () => {
    const url = "https://www.google.com/";
    fetchMock.mockRejectOnce();

    const request = new Request(
      new URL("/title?url=" + url, "http://localhost")
    );
    const response = await GET(request);
    const text = await response.text();
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(url); // Update the expected URL here
    expect(response.status).toBe(500);
    expect(text).toBe("Failed to fetch");
  });

  it("クエリにURLが指定されていない", async () => {
    fetchMock.mockResponseOnce(
      "<html><head><title>Google</title></head><body></body></html>"
    );

    const request = new Request(new URL("/title?url=", "http://localhost"));
    const response = await GET(request);
    const text = await response.text();
    expect(fetchMock.mock.calls.length).toEqual(0);
    expect(response.status).toBe(500);
    expect(text).toBe("Can't find url");
  });
});
