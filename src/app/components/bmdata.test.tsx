import { BMData } from "./bmdata";

/***
 * このテストは、BMDataクラスのインスタンスを生成し、そのインスタンスのをテストします。
 * BMDataクラスは、ブックマークのデータを管理するクラスです。
 * BMDataクラスは、タグを指定することができます。
 * タグを指定しない場合、ブックマークのデータは空の配列となります。
 */

describe("ブックマークのデータのクラスのテスト", () => {
  it("タグを指定しない場合の長さ0の配列が戻る", () => {
    const tag = "";
    const bmdata = BMData(tag);
    expect(bmdata).toHaveLength(0);
  });
});
