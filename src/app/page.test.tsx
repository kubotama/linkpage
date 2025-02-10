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
});
