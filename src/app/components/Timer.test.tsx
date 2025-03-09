import "@testing-library/jest-dom";

import React from "react";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

  it("開始ボタンを押すと停止ボタンが表示される", async () => {
    const user = userEvent.setup();

    render(<Timer />);
    await user.click(screen.getByRole("button", { name: "開始" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "停止" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "開始" })).toBeNull();
    });
  });
});
