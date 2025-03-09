import "@testing-library/jest-dom";

import React from "react";
import { Button } from "@mui/material";

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

  it("停止ボタンを押すと開始ボタンが表示される", async () => {
    const user = userEvent.setup();

    render(<Timer />);
    await user.click(screen.getByRole("button", { name: "開始" }));
    await user.click(screen.getByRole("button", { name: "停止" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "停止" })).toBeNull();
    });
  });

  it("開始ボタンがクリックされたら、handlerStartTimerが呼び出されたことを確認する", async () => {
    const user = userEvent.setup();
    const handlerStartTimerMock = jest.fn();
    //mock implementation to avoid changing internal state of component
    jest
      .spyOn(React, "useState")
      .mockReturnValueOnce([
        <Button key="start" onClick={handlerStartTimerMock}>
          開始
        </Button>,
        () => {},
      ])
      .mockReturnValueOnce([<Button key="stop">停止</Button>, () => {}]);
    render(<Timer />);
    await user.click(screen.getByRole("button", { name: "開始" }));
    expect(handlerStartTimerMock).toHaveBeenCalledTimes(1);
    jest.restoreAllMocks();
  });
});
