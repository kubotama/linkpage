import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("テスト環境を動作確認するためのサンプルのテスト", () => {
  it("Element", () => {
    render(<Home />);
    const Element = screen.getByText("linkpage");
    expect(Element).toBeInTheDocument();
  });
});
