import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { BmLink } from "./bmlink";
import { Bookmark } from "./bookmark";

/***
 * このテストは、ブックマークのリンクのインスタンスを生成して、そのインスタンスが正しいかをテストする。
 */

describe("ブックマークのリンクのテスト", () => {
  it("ブックマークのリンク(GitHub)のインスタンスが生成できる", () => {
    const bookmark: Bookmark = {
      url: "https://github.com/kubotama/linkpage",
      title: "kubotama/linkpage",
      tags: ["github"],
    };
    render(<BmLink bookmark={bookmark} />);
    const link = screen.getByText("kubotama/linkpage");
    expect(link).toHaveAttribute("href", bookmark.url);
  });
});
