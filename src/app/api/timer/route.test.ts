import "@testing-library/jest-dom";

import { GET } from "./route";

describe("タイマーの時間を取得するAPIのテスト", () => {
  it("180秒が返ってくる", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("180");
  });
});
