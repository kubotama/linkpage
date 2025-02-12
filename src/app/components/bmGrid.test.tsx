import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { BmGrid } from "./bmGrid";

const bookmarks = [
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
];

/***
 * このテストは、Bookmarksクラスのインスタンスを生成し、そのインスタンスのをテストします。
 * Bookmarksクラスは、ブックマークのデータを定義するクラスです。
 * Bookmarksクラスに定義されているブックマークを返します。
 **/

describe("ブックマークのデータのテスト", () => {
  it("GitHubのリンクを生成するテスト", () => {
    render(<BmGrid bookmarks={bookmarks} />);
    const bm = screen.getByText("kubotama/linkpage");
    expect(bm).toBeInTheDocument();
    expect(bm).toHaveAttribute("href", "https://github.com/kubotama/linkpage");
    expect(bm).toHaveAttribute("target", "_blank");
  });

  it("Amazonのリンクを生成するテスト", () => {
    render(<BmGrid bookmarks={bookmarks} />);
    const bm = screen.getByText("Amazon");
    expect(bm).toBeInTheDocument();
    expect(bm).toHaveAttribute("href", "https://www.amazon.co.jp/");
    expect(bm).toHaveAttribute("target", "_blank");
  });
});
