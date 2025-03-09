import "@testing-library/jest-dom";

import React from "react";

import { render, screen, waitFor } from "@testing-library/react";

import { Timer } from "./Timer";

describe("Timer", () => {
  it("タイマーが表示される", async () => {
    render(<Timer />);
    await waitFor(() => {
      expect(screen.getByText("02:30")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "停止" })).toBeNull();
    });
  });
});
