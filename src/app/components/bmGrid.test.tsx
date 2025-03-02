import "@testing-library/jest-dom";

// import fetchMock from "jest-fetch-mock";
import React from "react";

import { render, screen } from "@testing-library/react";

import { BmGrid } from "./bmGrid";
import { Bookmark } from "./bmRow";

const mockBookmarks: Bookmark[] = [
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

describe("ブックマークのデータを表示を確認", () => {
  it("ブックマークのデータを表示を確認", () => {
    render(<BmGrid bookmarks={mockBookmarks} />);

    const bm1 = screen.getByText("kubotama/linkpage");
    expect(bm1).toBeInTheDocument();
    expect(bm1).toHaveAttribute("href", "https://github.com/kubotama/linkpage");
    expect(bm1).toHaveAttribute("target", "_blank");

    const bm2 = screen.getByText("Google");
    expect(bm2).toBeInTheDocument();
    expect(bm2).toHaveAttribute("href", "https://www.google.com/");
    expect(bm2).toHaveAttribute("target", "_blank");

    const bm3 = screen.getByText("Gmail");
    expect(bm3).toBeInTheDocument();
    expect(bm3).toHaveAttribute("href", "https://mail.google.com");
    expect(bm3).toHaveAttribute("target", "_blank");

    const bm4 = screen.getByText("Amazon");
    expect(bm4).toBeInTheDocument();
    expect(bm4).toHaveAttribute("href", "https://www.amazon.co.jp/");
    expect(bm4).toHaveAttribute("target", "_blank");
  });
});
