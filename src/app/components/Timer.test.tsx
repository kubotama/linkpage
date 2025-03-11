import "@testing-library/jest-dom";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timer } from "./Timer";

describe("Timer コンポーネント", () => {
  it("初期画面で 01:15 と開始ボタンが表示されること", () => {
    render(<Timer durationTime={10} />);
    expect(screen.getByText("00:10")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
  });

  it.skip("開始ボタンをクリックすると停止ボタンが表示されること", async () => {
    const user = userEvent.setup();

    const { getByRole } = render(<Timer durationTime={170} />);
    const startButton = getByRole("button", { name: "開始" });
    await user.click(startButton);
    expect(getByRole("button", { name: "停止" })).toBeInTheDocument();
  });

  it.skip("停止ボタンをクリックすると開始ボタンが表示されること", () => {
    const { getByRole } = render(<Timer durationTime={170} />);
    const startButton = getByRole("button", { name: "開始" });

    act(() => {
      userEvent.click(startButton);
    });

    const stopButton = getByRole("button", { name: "停止" });

    act(() => {
      userEvent.click(stopButton);
    });

    expect(getByRole("button", { name: "開始" })).toBeInTheDocument();
  });
});
