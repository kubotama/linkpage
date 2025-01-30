import { BMData } from "./bmdata";

describe("ブックマークのデータのクラスのテスト", () => {
  it("カテゴリーを指定しない場合の長さ0の配列が戻る", () => {
    const bmdata = BMData();
    expect(bmdata).toHaveLength(0);
  });
});
