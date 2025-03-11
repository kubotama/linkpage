import "@testing-library/jest-dom";
import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timer } from "./Timer";

describe("Timer コンポーネント", () => {
  it("初期画面で 01:15 と開始ボタンが表示されること", () => {
    const { getByRole, getByTestId } = render(<Timer durationTime={10} />);
    expect(getByTestId("timer-text")).toHaveTextContent("00:10");
    expect(getByRole("button", { name: "開始" })).toBeInTheDocument();
  });

  it("開始ボタンをクリックすると停止ボタンが表示されること", () => {
    const user = userEvent.setup();

    const { getByRole } = render(<Timer durationTime={150} />);
    const startButton = getByRole("button", { name: "開始" });
    user.click(startButton).then(() => {
      expect(getByRole("button", { name: "停止" })).toBeInTheDocument();
    });
  });

  it("停止ボタンをクリックすると開始ボタンが表示されること", () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Timer durationTime={170} />);
    const startButton = getByRole("button", { name: "開始" });

    user
      .click(startButton)
      .then(() => {
        jest.advanceTimersByTime(30000); // 30秒進める
        const stopButton = getByRole("button", { name: "停止" });

        return user.click(stopButton);
      })
      .then(() => {
        expect(getByRole("button", { name: "開始" })).toBeInTheDocument();
      });
  });
});
