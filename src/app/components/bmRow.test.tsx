import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { BmRow } from "./bmRow";
import { Bookmark } from "./bookmark";

/***
 * このテストは、ブックマークのリンクのインスタンスを生成して、そのインスタンスが正しいかをテストする。
 */

describe("ブックマークのリンクのテスト", () => {
  it("ブックマークのリンク(GitHub)のインスタンスが生成できる", () => {
    const bookmark: Bookmark = {
      url: "https://github.com/kubotama/linkpage",
      title: "kubotama/linkpage",
    };
    render(<BmRow bookmark={bookmark} />);
    const link = screen.getByText("kubotama/linkpage");
    expect(link).toHaveAttribute("href", bookmark.url);
  });

  it("ブックマークのリンク(Gmail)のインスタンスが生成できる", () => {
    const bookmark: Bookmark = {
      url: "https://mail.google.com",
      title: "Gmail",
    };
    render(<BmRow bookmark={bookmark} />);
    const link = screen.getByText("Gmail");
    expect(link).toHaveAttribute("href", bookmark.url);
  });
});
