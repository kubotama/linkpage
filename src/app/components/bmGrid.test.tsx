import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";

import { BmGrid } from "./bmGrid";

/***
 * このテストは、Bookmarksクラスのインスタンスを生成し、そのインスタンスのをテストします。
 * Bookmarksクラスは、ブックマークのデータを定義するクラスです。
 * Bookmarksクラスに定義されているブックマークを返します。
 **/

describe("ブックマークのデータのテスト", () => {
  // it.skip("定義されているブックマークが返る", () => {
  //   return Bookmarks().then((bookmarks) => {
  //     expect(bookmarks).toEqual([
  //       {
  //         url: "https://github.com/kubotama/linkpage",
  //         title: "kubotama/linkpage",
  //       },
  //       {
  //         url: "https://www.google.com/",
  //         title: "Google",
  //       },
  //       {
  //         url: "https://mail.google.com",
  //         title: "Gmail",
  //       },
  //       {
  //         url: "https://www.amazon.co.jp/",
  //         title: "Amazon",
  //       },
  //     ]);
  //   });
  // });

  it("GitHubのリンクを生成するテスト", async () => {
    render(<BmGrid />);
    await waitFor(() => {
      const GitHub = screen.getByText("kubotama/linkpage");
      expect(GitHub).toBeInTheDocument();
      expect(GitHub).toHaveAttribute(
        "href",
        "https://github.com/kubotama/linkpage"
      );
      expect(GitHub).toHaveAttribute("target", "_blank");
    });
  });

  it("Amazonのリンクを生成するテスト", async () => {
    render(<BmGrid />);
    await waitFor(() => {
      const GitHub = screen.getByText("Amazon");
      expect(GitHub).toBeInTheDocument();
      expect(GitHub).toHaveAttribute("href", "https://www.amazon.co.jp/");
      expect(GitHub).toHaveAttribute("target", "_blank");
    });
  });
});
