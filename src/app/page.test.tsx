import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("テスト環境を動作確認するためのサンプルのテスト", () => {
  it("タイトル", () => {
    render(<Home />);
    const title = screen.getByText("linkpage");
    expect(title).toBeInTheDocument();
  });

  // it("GitHubのリンクを生成するテスト", async () => {
  //   render(<Home />);
  //   await waitFor(() => {
  //     const GitHub = screen.getByText("kubotama/linkpage");
  //     expect(GitHub).toBeInTheDocument();
  //     expect(GitHub).toHaveAttribute(
  //       "href",
  //       "https://github.com/kubotama/linkpage"
  //     );
  //     expect(GitHub).toHaveAttribute("target", "_blank");
  //   });
  // });

  // it("Amazonのリンクを生成するテスト", async () => {
  //   render(<Home />);
  //   await waitFor(() => {
  //     const GitHub = screen.getByText("Amazon");
  //     expect(GitHub).toBeInTheDocument();
  //     expect(GitHub).toHaveAttribute("href", "https://www.amazon.co.jp/");
  //     expect(GitHub).toHaveAttribute("target", "_blank");
  //   });
  // });
});
