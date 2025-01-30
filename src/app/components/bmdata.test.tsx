import { BMData } from "./bmdata";

/***
 * このテストは、BMDataクラスのインスタンスを生成し、そのインスタンスのをテストします。
 * BMDataクラスは、ブックマークのデータを管理するクラスです。
 * BMDataクラスは、カテゴリーを指定することができます。
 * カテゴリーを指定しない場合、ブックマークのデータは空の配列となります。
 * カテゴリーに"github"を指定した場合、ブックマークのデータは、
 * [{"url":"https://github.com/kubotama/linkpage","title":"kubotama/linkpage"}]となります。
 * カテゴリーに"google"を指定した場合、ブックマークのデータは、
 * [{"url":"https://www.google.com/","title":"Google"},{"url":"https://mail.google.com","title":"Gmail"}]となります。
 */

describe("ブックマークのデータのクラスのテスト", () => {
  it("カテゴリーを指定しない場合の長さ0の配列が戻る", () => {
    const category = "";
    const bmdata = BMData(category);
    expect(bmdata).toHaveLength(0);
  });
});
